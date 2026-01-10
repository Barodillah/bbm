<?php
/**
 * Database Configuration
 * JJM Financial Management App
 */

define('DB_HOST', '153.92.15.23');
define('DB_PORT', '3306');
define('DB_NAME', 'u444914729_jjm');
define('DB_USER', 'u444914729_jjm');
define('DB_PASS', 'Sagala.4321');

// OpenRouter AI Configuration
define('OPENROUTER_API_KEY', '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');
define('OPENROUTER_MODEL', 'xiaomi/mimo-v2-flash:free');
define('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get PDO Database Connection
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    
    return $pdo;
}

/**
 * JSON Response Helper
 */
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

/**
 * Get Request Body as JSON
 */
function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
