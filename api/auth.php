<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

function initSettingsTable($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            key_name VARCHAR(50) UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM settings WHERE key_name = 'user_pin'");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row['cnt'] == 0) {
        $pdo->exec("INSERT INTO settings (key_name, value) VALUES ('user_pin', '4321')");
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM settings WHERE key_name = 'backup_pin'");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row['cnt'] == 0) {
        $pdo->exec("INSERT INTO settings (key_name, value) VALUES ('backup_pin', '2098')");
    }
}

function verifyPin($pdo, $pin) {
    if (!$pin) return false;
    $stmt = $pdo->prepare("SELECT value FROM settings WHERE key_name IN ('user_pin', 'backup_pin')");
    $stmt->execute();
    $rows = $stmt->fetchAll();
    $validPins = array_map(function($r) { return $r['value']; }, $rows);
    return in_array($pin, $validPins);
}

try {
    initSettingsTable($pdo);

    $input = json_decode(file_get_contents('php://input'), true);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $pin = $input['pin'] ?? '';
        
        if (!$pin || strlen($pin) !== 4 || !ctype_digit($pin)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'PIN harus 4 digit angka']);
            exit;
        }

        if (verifyPin($pdo, $pin)) {
            echo json_encode(['success' => true, 'message' => 'Login berhasil']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'PIN salah']);
        }
    } elseif ($method === 'PUT') {
        $currentPin = $input['currentPin'] ?? '';
        $newPin = $input['newPin'] ?? '';

        if (!$newPin || strlen($newPin) !== 4 || !ctype_digit($newPin)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'PIN baru harus 4 digit angka']);
            exit;
        }

        if (!verifyPin($pdo, $currentPin)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'PIN saat ini salah']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE settings SET value = ? WHERE key_name = 'user_pin'");
        $stmt->execute([$newPin]);
        echo json_encode(['success' => true, 'message' => 'PIN berhasil diubah']);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
