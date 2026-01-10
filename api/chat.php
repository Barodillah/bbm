<?php
/**
 * AI Chat API Endpoint
 * POST /api/chat.php - Send message to AI and get response
 * GET /api/chat.php - Get chat history
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get chat history
        $stmt = $pdo->query("
            SELECT id, role, content, created_at 
            FROM chat_messages 
            ORDER BY created_at ASC
            LIMIT 50
        ");
        jsonResponse($stmt->fetchAll());
        break;
        
    case 'POST':
        $data = getRequestBody();
        
        if (empty($data['message'])) {
            jsonResponse(['error' => 'Message is required'], 400);
        }
        
        $userMessage = $data['message'];
        $context = $data['context'] ?? '';
        
        // Save user message
        $stmt = $pdo->prepare("INSERT INTO chat_messages (role, content) VALUES ('user', ?)");
        $stmt->execute([$userMessage]);
        
        // Build system prompt with financial context
        $systemPrompt = "Kamu adalah AI Financial Assistant untuk aplikasi manajemen keuangan pribadi bernama JJM. 
Tugasmu adalah membantu user menganalisis keuangan mereka, memberikan tips hemat, dan menjawab pertanyaan seputar keuangan.
Jawab dalam Bahasa Indonesia yang ramah dan casual.
Gunakan emoji sesekali untuk membuat respons lebih engaging.
Jika ada data keuangan user, berikan analisis yang relevan.";

        if (!empty($context)) {
            $systemPrompt .= "\n\nBerikut data keuangan user saat ini:\n" . $context;
        }
        
        // Call OpenRouter API
        $response = callOpenRouter($systemPrompt, $userMessage);
        
        if (isset($response['error'])) {
            jsonResponse(['error' => $response['error']], 500);
        }
        
        $aiMessage = $response['choices'][0]['message']['content'] ?? 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';
        
        // Save AI response
        $stmt = $pdo->prepare("INSERT INTO chat_messages (role, content) VALUES ('assistant', ?)");
        $stmt->execute([$aiMessage]);
        
        jsonResponse([
            'success' => true,
            'message' => $aiMessage
        ]);
        break;
        
    case 'DELETE':
        // Clear chat history
        $pdo->exec("DELETE FROM chat_messages");
        jsonResponse(['success' => true, 'message' => 'Chat history cleared']);
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Call OpenRouter API
 */
function callOpenRouter($systemPrompt, $userMessage) {
    $payload = [
        'model' => OPENROUTER_MODEL,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage]
        ],
        'max_tokens' => 1000,
        'temperature' => 0.7
    ];
    
    $ch = curl_init(OPENROUTER_API_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENROUTER_API_KEY,
            'HTTP-Referer: http://localhost:5173',
            'X-Title: JJM Financial App'
        ],
        CURLOPT_TIMEOUT => 60
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => 'cURL error: ' . $error];
    }
    
    $decoded = json_decode($response, true);
    
    if ($httpCode !== 200) {
        return ['error' => $decoded['error']['message'] ?? 'API request failed with code ' . $httpCode];
    }
    
    return $decoded;
}
