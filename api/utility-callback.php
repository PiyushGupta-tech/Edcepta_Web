<?php
/**
 * /api/utility-callback.php
 * - POST: UrbanRupee merchant webhook (JSON or form)
 * - GET: browser visits redirect to payment return page (not a public API)
 */
require_once __DIR__ . '/_helpers.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Browser / redirect hits — never show raw JSON error
if ($method === 'GET' || $method === 'HEAD') {
    $qs = [];
    foreach (['orderid', 'order_id', 'status', 'amount', 'utr'] as $key) {
        if (isset($_GET[$key]) && $_GET[$key] !== '') {
            $qs[$key] = $_GET[$key];
        }
    }
    $target = '/payment-return.html';
    if ($qs) {
        $target .= '?' . http_build_query($qs);
    }
    header('Location: ' . $target, true, 302);
    exit;
}

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    ur_json_response(['status' => false, 'message' => 'Method not allowed'], 405);
}

$payload = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? ($_SERVER['HTTP_CONTENT_TYPE'] ?? '');

if (stripos($contentType, 'application/json') !== false) {
    $payload = ur_read_json_body();
} else {
    $payload = $_POST;
    if (!$payload) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $payload = $decoded;
        } elseif ($raw !== '' && $raw !== false) {
            parse_str($raw, $parsed);
            if (is_array($parsed)) {
                $payload = $parsed;
            }
        }
    }
}

$orderid = trim((string) ($payload['orderid'] ?? ''));
$status = strtolower(trim((string) ($payload['status'] ?? '')));

if ($orderid === '') {
    ur_json_response(['status' => false, 'message' => 'Missing orderid'], 400);
}

$existing = ur_load_order($orderid) ?: ['orderid' => $orderid];
$existing['status'] = $status !== '' ? $status : ($existing['status'] ?? 'unknown');
$existing['callback'] = $payload;
$existing['callback_received_at'] = date('c');

if (isset($payload['utr'])) {
    $existing['utr'] = $payload['utr'];
}
if (isset($payload['vendor_id'])) {
    $existing['vendor_id'] = $payload['vendor_id'];
}
if (isset($payload['gateway_orderid'])) {
    $existing['gateway_orderid'] = $payload['gateway_orderid'];
}
if (isset($payload['settlement_amount'])) {
    $existing['settlement_amount'] = $payload['settlement_amount'];
}
if (isset($payload['amount'])) {
    $existing['amount'] = $payload['amount'];
}

ur_save_order($orderid, $existing);

ur_json_response([
    'status' => true,
    'message' => 'Callback received',
    'orderid' => $orderid,
]);
