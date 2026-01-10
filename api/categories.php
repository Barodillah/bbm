<?php
/**
 * Categories API Endpoint
 * GET /api/categories.php - List all categories
 * POST /api/categories.php - Create new category
 * PUT /api/categories.php?id=X - Update category
 * DELETE /api/categories.php?id=X - Delete category
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY type, name");
        jsonResponse($stmt->fetchAll());
        break;
        
    case 'POST':
        $data = getRequestBody();
        
        if (empty($data['name']) || empty($data['type'])) {
            jsonResponse(['error' => 'Name and type are required'], 400);
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO categories (name, color, type)
            VALUES (:name, :color, :type)
        ");
        
        $stmt->execute([
            'name' => $data['name'],
            'color' => $data['color'] ?? '#9CA3AF',
            'type' => $data['type']
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$newId]);
        
        jsonResponse($stmt->fetch(), 201);
        break;
        
    case 'PUT':
        if (!$id) {
            jsonResponse(['error' => 'Category ID required'], 400);
        }
        
        $data = getRequestBody();
        
        $stmt = $pdo->prepare("
            UPDATE categories 
            SET name = :name, color = :color, type = :type
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'color' => $data['color'],
            'type' => $data['type']
        ]);
        
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        
        jsonResponse($stmt->fetch());
        break;
        
    case 'DELETE':
        if (!$id) {
            jsonResponse(['error' => 'Category ID required'], 400);
        }
        
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        
        jsonResponse(['success' => true, 'deleted' => $id]);
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
