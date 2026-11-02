<?php
/**
 * Shared helpers for UrbanRupee utility payment APIs.
 */

function ur_json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data);
    exit;
}

function ur_read_json_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }
    return $data;
}

function ur_normalize_mobile($mobile) {
    $digits = preg_replace('/\D+/', '', (string) $mobile);
    if (strlen($digits) > 10 && substr($digits, 0, 2) === '91') {
        $digits = substr($digits, -10);
    }
    return $digits;
}

function ur_make_orderid() {
    // Unique, compact, within UrbanRupee length limits
    return 'EDU_UR72_' . strtoupper(base_convert((string) time(), 10, 36)) . substr(strtoupper(bin2hex(random_bytes(3))), 0, 6);
}

function ur_orders_dir() {
    $dir = __DIR__ . '/orders';
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    return $dir;
}

function ur_save_order($orderid, $payload) {
    $safe = preg_replace('/[^A-Za-z0-9_\-]/', '', $orderid);
    if ($safe === '') {
        return false;
    }
    $file = ur_orders_dir() . '/' . $safe . '.json';
    $payload['updated_at'] = date('c');
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $ok = @file_put_contents($file, $json, LOCK_EX);
    if ($ok === false) {
        error_log('UrbanRupee: failed to write order file ' . $file);
        return false;
    }
    return true;
}

function ur_load_order($orderid) {
    $safe = preg_replace('/[^A-Za-z0-9_\-]/', '', $orderid);
    $file = ur_orders_dir() . '/' . $safe . '.json';
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : null;
}

function ur_http_post_json($url, $payload) {
    $ch = curl_init($url);
    $body = json_encode($payload);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 20,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        return [
            'ok' => false,
            'http_code' => $code,
            'error' => $error ?: ('cURL error ' . $errno),
            'data' => null,
        ];
    }

    $decoded = json_decode($response, true);
    return [
        'ok' => $code >= 200 && $code < 300,
        'http_code' => $code,
        'error' => null,
        'data' => is_array($decoded) ? $decoded : ['raw' => $response],
    ];
}

function ur_public_base_url() {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'educepta.in';
    // Localhost callbacks are not reachable by UrbanRupee — use live site webhook
    if (preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/i', $host)) {
        return 'https://educepta.in';
    }
    return $scheme . '://' . $host;
}
