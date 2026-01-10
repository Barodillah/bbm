<?php
/**
 * Auth/Settings API Endpoint
 * GET /api/auth.php - Check if authenticated
 * POST /api/auth.php - Login with PIN
 * PUT /api/auth.php - Update PIN (requires current session)
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure settings table exists with PIN
initSettingsTable($pdo);

switch ($method) {
    case 'GET':
        // Check if PIN is correct (from session/header)
        $pin = $_GET['pin'] ?? '';
        $result = verifyPin($pdo, $pin);
        jsonResponse(['authenticated' => $result]);
        break;
        
    case 'POST':
        // Login with PIN
        $data = getRequestBody();
        $pin = $data['pin'] ?? '';
        
        if (strlen($pin) !== 4 || !ctype_digit($pin)) {
            jsonResponse(['success' => false, 'error' => 'PIN harus 4 digit angka'], 400);
        }
        
        if (verifyPin($pdo, $pin)) {
            jsonResponse(['success' => true, 'message' => 'Login berhasil']);
        } else {
            jsonResponse(['success' => false, 'error' => 'PIN salah'], 401);
        }
        break;
        
    case 'PUT':
        // Update PIN
        $data = getRequestBody();
        $currentPin = $data['currentPin'] ?? '';
        $newPin = $data['newPin'] ?? '';
        
        if (strlen($newPin) !== 4 || !ctype_digit($newPin)) {
            jsonResponse(['success' => false, 'error' => 'PIN baru harus 4 digit angka'], 400);
        }
        
        // Verify current PIN first
        if (!verifyPin($pdo, $currentPin)) {
            jsonResponse(['success' => false, 'error' => 'PIN saat ini salah'], 401);
        }
        
        // Update PIN
        $stmt = $pdo->prepare("UPDATE settings SET value = ? WHERE key_name = 'user_pin'");
        $stmt->execute([$newPin]);
        
        jsonResponse(['success' => true, 'message' => 'PIN berhasil diubah']);
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Initialize settings table with default PIN
 */
function initSettingsTable($pdo) {
    // Create settings table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            key_name VARCHAR(50) UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Check if user_pin exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM settings WHERE key_name = 'user_pin'");
    if ($stmt->fetchColumn() == 0) {
        // Insert default PIN: 4321
        $pdo->exec("INSERT INTO settings (key_name, value) VALUES ('user_pin', '4321')");
    }
    
    // Check if backup_pin exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM settings WHERE key_name = 'backup_pin'");
    if ($stmt->fetchColumn() == 0) {
        // Insert backup PIN: 2098
        $pdo->exec("INSERT INTO settings (key_name, value) VALUES ('backup_pin', '2098')");
    }
}

/**
 * Verify PIN against user_pin or backup_pin
 */
function verifyPin($pdo, $pin) {
    if (empty($pin)) return false;
    
    $stmt = $pdo->prepare("SELECT value FROM settings WHERE key_name IN ('user_pin', 'backup_pin')");
    $stmt->execute();
    $validPins = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    return in_array($pin, $validPins);
}
