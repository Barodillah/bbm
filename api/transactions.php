<?php
/**
 * Transactions API Endpoint
 * GET /api/transactions.php - List all transactions
 * POST /api/transactions.php - Create new transaction
 * PUT /api/transactions.php?id=X - Update transaction
 * DELETE /api/transactions.php?id=X - Delete transaction
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        // Get all transactions ordered by date desc
        $stmt = $pdo->query("
            SELECT id, title, amount, type, category, date, notes, created_at 
            FROM transactions 
            ORDER BY date DESC, id DESC
        ");
        $transactions = $stmt->fetchAll();
        
        // Convert amount to float for JavaScript
        foreach ($transactions as &$tx) {
            $tx['amount'] = (float) $tx['amount'];
        }
        
        jsonResponse($transactions);
        break;
        
    case 'POST':
        $data = getRequestBody();
        
        if (empty($data['title']) || !isset($data['amount']) || empty($data['type']) || empty($data['category'])) {
            jsonResponse(['error' => 'Missing required fields'], 400);
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO transactions (title, amount, type, category, date, notes)
            VALUES (:title, :amount, :type, :category, :date, :notes)
        ");
        
        $stmt->execute([
            'title' => $data['title'],
            'amount' => $data['amount'],
            'type' => $data['type'],
            'category' => $data['category'],
            'date' => $data['date'] ?? date('Y-m-d'),
            'notes' => $data['notes'] ?? null
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Return created transaction
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$newId]);
        $transaction = $stmt->fetch();
        $transaction['amount'] = (float) $transaction['amount'];
        
        jsonResponse($transaction, 201);
        break;
        
    case 'PUT':
        if (!$id) {
            jsonResponse(['error' => 'Transaction ID required'], 400);
        }
        
        $data = getRequestBody();
        
        $stmt = $pdo->prepare("
            UPDATE transactions 
            SET title = :title, amount = :amount, type = :type, 
                category = :category, date = :date, notes = :notes
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'title' => $data['title'],
            'amount' => $data['amount'],
            'type' => $data['type'],
            'category' => $data['category'],
            'date' => $data['date'],
            'notes' => $data['notes'] ?? null
        ]);
        
        // Return updated transaction
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$id]);
        $transaction = $stmt->fetch();
        if ($transaction) {
            $transaction['amount'] = (float) $transaction['amount'];
        }
        
        jsonResponse($transaction);
        break;
        
    case 'DELETE':
        if (!$id) {
            jsonResponse(['error' => 'Transaction ID required'], 400);
        }
        
        $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
        $stmt->execute([$id]);
        
        jsonResponse(['success' => true, 'deleted' => $id]);
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
