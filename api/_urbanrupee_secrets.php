<?php
/**
 * Server-only credentials. Do not expose via browser.
 */
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['status' => false, 'message' => 'Forbidden']);
    exit;
}

return [
    'userid' => 'UR72',
    // Keep token in single quotes — $ must not be interpolated
    'token' => '$2y$10$zoXy.9Mw72M5hQfxSLWm4uZSkH.hcRDxV49aWRagYEyniM0.OXsPK',
    'initiate_url' => 'https://merchant.urbanrupee.in/api/pg/utility/initiate',
    'checkstatus_url' => 'https://merchant.urbanrupee.in/api/pg/utility/checkstatus',
    'min_amount' => 100,
    'max_amount' => 100000,
    'payment_mode' => 'CARD',
];
