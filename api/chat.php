<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Title, HTTP-Referer');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

$OPENROUTER_API_KEY = getenv('OPENROUTER_API_KEY');
$AI_MODEL = 'xiaomi/mimo-v2-flash:free';

function callOpenRouter($systemPrompt, $userMessage) {
    global $OPENROUTER_API_KEY, $AI_MODEL;
    
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    
    $data = [
        'model' => $AI_MODEL,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage]
        ]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $OPENROUTER_API_KEY",
        "Content-Type: application/json",
        "HTTP-Referer: https://jejemoney.vercel.app",
        "X-Title: JJM - Jurnal Jeje Money"
    ]);
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        return ['error' => ['message' => curl_error($ch)]];
    }
    
    curl_close($ch);
    return json_decode($response, true);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50");
        $rows = $stmt->fetchAll();
        echo json_encode(array_reverse($rows));
    }
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $context = $input['context'] ?? '';

        if (!$message) {
            echo json_encode(['error' => 'Message required']);
            exit;
        }

        $systemPrompt = "Kamu adalah asisten keuangan pribadi bernama JJ. Kamu membantu user mengelola keuangan mereka dengan ramah dan profesional dalam Bahasa Indonesia.\n\nKonteks keuangan user saat ini:\n" . ($context ?: 'Tidak ada data keuangan tersedia.') . "\n\nBerikan saran yang relevan berdasarkan data di atas. Jawab dengan singkat, padat, dan ramah. Gunakan emoji untuk membuat percakapan lebih menarik.";

        // Save user message
        $stmt = $pdo->prepare("INSERT INTO chat_messages (role, content) VALUES (?, ?)");
        $stmt->execute(['user', $message]);

        // Call AI
        $aiResponse = callOpenRouter($systemPrompt, $message);

        // Check for error
        if (isset($aiResponse['error'])) {
            $errorMsg = is_array($aiResponse['error']) && isset($aiResponse['error']['message']) 
                ? $aiResponse['error']['message'] 
                : json_encode($aiResponse['error']);

            $stmt->execute(['assistant', "Error: $errorMsg"]);
            echo json_encode([
                'response' => 'Maaf, ada kendala pada sistem AI.',
                'debug' => $aiResponse['error']
            ]);
            exit;
        }

        $aiMessage = $aiResponse['choices'][0]['message']['content'] ?? null;

        if (!$aiMessage) {
            echo json_encode([
                'response' => 'Maaf, tidak ada respon dari AI.',
                'debug' => $aiResponse
            ]);
            exit;
        }

        // Save AI response
        $stmt->execute(['assistant', $aiMessage]);

        echo json_encode(['response' => $aiMessage]);
    }
    elseif ($method === 'DELETE') {
        $pdo->exec("DELETE FROM chat_messages");
        echo json_encode(['success' => true]);
    }
    else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
