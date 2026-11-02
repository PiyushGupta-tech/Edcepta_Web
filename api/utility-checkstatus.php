<?php
/**
 * POST /api/utility-checkstatus.php
 * Poll UrbanRupee for order status.
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
$orderid = trim((string) ($body['orderid'] ?? ''));

if ($orderid === '') {
    ur_json_response(['status' => false, 'message' => 'orderid is required'], 400);
}

$result = ur_http_post_json($cfg['checkstatus_url'], [
    'userid' => $cfg['userid'],
    'token' => $cfg['token'],
    'orderid' => $orderid,
]);

if (!$result['ok'] || empty($result['data'])) {
    ur_json_response([
        'status' => false,
        'message' => $result['error'] ?: 'Unable to fetch payment status.',
    ], 502);
}

$gw = $result['data'];
$local = ur_load_order($orderid);

if (!empty($gw['data']) && is_array($gw['data'])) {
    $status = strtolower((string) ($gw['data']['status'] ?? ''));
    if ($local) {
        $local['gateway_status'] = $gw['data'];
        $local['status'] = $status !== '' ? $status : ($local['status'] ?? 'unknown');
        ur_save_order($orderid, $local);
    }
}

ur_json_response($gw);
