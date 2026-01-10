<?php
/**
 * Database Migration Script
 * Creates all required tables for JJM app
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = getDB();
    
    // Create categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            color VARCHAR(7) DEFAULT '#9CA3AF',
            type ENUM('income', 'expense') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create transactions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Create chat_messages table for AI history
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role ENUM('user', 'assistant') NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Check if categories table is empty, seed default data
    $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO categories (name, color, type) VALUES
            ('Food', '#F87171', 'expense'),
            ('Transport', '#60A5FA', 'expense'),
            ('Bills', '#FBBF24', 'expense'),
            ('Work', '#34D399', 'income'),
            ('Freelance', '#818CF8', 'income'),
            ('Shopping', '#F472B6', 'expense'),
            ('Health', '#2DD4BF', 'expense'),
            ('Others', '#9CA3AF', 'expense')
        ");
    }
    
    // Check if transactions table is empty, seed demo data
    $stmt = $pdo->query("SELECT COUNT(*) FROM transactions");
    if ($stmt->fetchColumn() == 0) {
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $twoDaysAgo = date('Y-m-d', strtotime('-2 days'));
        
        $pdo->exec("
            INSERT INTO transactions (title, amount, type, category, date) VALUES
            ('Gaji Bulanan', 15000000, 'income', 'Work', '$today'),
            ('Kopi Kenangan', 45000, 'expense', 'Food', '$today'),
            ('Listrik & Air', 850000, 'expense', 'Bills', '$yesterday'),
            ('Bonus Project', 2500000, 'income', 'Freelance', '$yesterday'),
            ('Makan Malam', 120000, 'expense', 'Food', '$twoDaysAgo'),
            ('Bensin Motor', 100000, 'expense', 'Transport', '$twoDaysAgo')
        ");
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Database migration completed successfully',
        'tables' => ['categories', 'transactions', 'chat_messages']
    ]);
    
} catch (Exception $e) {
    jsonResponse(['error' => 'Migration failed: ' . $e->getMessage()], 500);
}
