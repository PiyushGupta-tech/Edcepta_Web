<?php
/**
 * POST /api/utility-initiate.php
 * Creates UrbanRupee utility order and returns hosted checkout_url.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ur_json_response(['status' => false, 'message' => 'Method not allowed'], 405);
}

$cfg = require __DIR__ . '/_urbanrupee_secrets.php';
$body = ur_read_json_body();

$amount = isset($body['amount']) ? (float) $body['amount'] : 0;
$amount = (int) round($amount);
$name = trim((string) ($body['name'] ?? ''));
$mobile = ur_normalize_mobile($body['mobile'] ?? '');
$email = trim((string) ($body['email'] ?? ''));
$items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];

if ($amount < (int) $cfg['min_amount'] || $amount > (int) $cfg['max_amount']) {
    ur_json_response([
        'status' => false,
        'message' => 'Amount must be between ₹' . $cfg['min_amount'] . ' and ₹' . number_format($cfg['max_amount']) . '.',
    ], 400);
}

if ($name === '' || strlen($mobile) !== 10) {
    ur_json_response([
        'status' => false,
        'message' => 'Valid customer name and 10-digit mobile are required.',
    ], 400);
}

$orderid = ur_make_orderid();
$base = ur_public_base_url();
$callbackUrl = $base . '/api/utility-callback.php';

$payload = [
    'userid' => $cfg['userid'],
    'token' => $cfg['token'],
    'amount' => $amount,
    'mobile' => $mobile,
    'name' => $name,
    'orderid' => $orderid,
    'callback_url' => $callbackUrl,
    'paymentMode' => $cfg['payment_mode'],
    'redirect_mode' => 'checkout',
];

if ($email !== '') {
    $payload['email'] = $email;
}

$result = ur_http_post_json($cfg['initiate_url'], $payload);

if ($result['error'] && empty($result['data'])) {
    ur_json_response([
        'status' => false,
        'message' => $result['error'] ?: 'Unable to reach payment gateway. Please try again.',
    ], 502);
}

$gw = is_array($result['data']) ? $result['data'] : [];
$checkoutUrl = $gw['checkout_url'] ?? ($gw['payment_url'] ?? null);

if (!$result['ok'] || empty($gw['status']) || !$checkoutUrl) {
    $code = $result['http_code'] >= 400 ? $result['http_code'] : 400;
    $msg = (string) ($gw['message'] ?? 'Payment initiation failed.');
    if (!empty($gw['detected_ip'])) {
        $msg .= ' (server IP: ' . $gw['detected_ip'] . ')';
    }
    if (!empty($gw['hint'])) {
        $msg .= ' ' . $gw['hint'];
    }
    ur_json_response([
        'status' => false,
        'message' => $msg,
    ], $code);
}

ur_save_order($orderid, [
    'orderid' => $orderid,
    'amount' => $amount,
    'name' => $name,
    'mobile' => $mobile,
    'email' => $email,
    'items' => $items,
    'status' => 'initiated',
    'checkout_url' => $checkoutUrl,
    'created_at' => date('c'),
]);

ur_json_response([
    'status' => true,
    'message' => $gw['message'] ?? 'Checkout ready',
    'orderid' => $orderid,
    'amount' => $amount,
    'checkout_url' => $checkoutUrl,
    'session_ttl_minutes' => $gw['session_ttl_minutes'] ?? 30,
]);
