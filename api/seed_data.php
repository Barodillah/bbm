<?php
/**
 * Data Migration Script
 * Clears transactions and inserts new data
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = getDB();
    
    // Clear existing transactions
    $pdo->exec("TRUNCATE TABLE transactions");
    
    // Ensure categories exist
    $categories = [
        ['Income', '#34D399', 'income'],
        ['Bill', '#FBBF24', 'expense'],
        ['Food', '#F87171', 'expense'],
        ['Social', '#A78BFA', 'expense'],
        ['Transportation', '#60A5FA', 'expense'],
    ];
    
    foreach ($categories as $cat) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO categories (name, color, type) VALUES (?, ?, ?)");
        $stmt->execute($cat);
    }
    
    // New transaction data
    $transactions = [
        ['2026-01-01', 'income', 'Income', 'Gaji', 2570300],
        ['2026-01-01', 'income', 'Income', 'Tukin', 8736137],
        ['2026-01-01', 'expense', 'Bill', 'CBB', 100000],
        ['2026-01-01', 'expense', 'Bill', 'Kas seksi', 100000],
        ['2026-01-01', 'expense', 'Bill', 'Paguyuban', 87361],
        ['2026-01-02', 'expense', 'Food', 'Bebek cabe ijo', 23825],
        ['2026-01-02', 'expense', 'Social', 'Sewa toga', 150000],
        ['2026-01-02', 'expense', 'Food', 'Kantin 1x', 12000],
        ['2026-01-03', 'expense', 'Food', 'Martabak', 30875],
        ['2026-01-04', 'expense', 'Transportation', 'Grab', 7000],
        ['2026-01-04', 'expense', 'Transportation', 'TJ PP', 7000],
        ['2026-01-04', 'expense', 'Food', 'Kedai penuh nikmat', 139000],
        ['2026-01-04', 'expense', 'Food', 'T ninety Nine', 61600],
        ['2026-01-04', 'expense', 'Food', 'Papaya', 77000],
        ['2026-01-04', 'expense', 'Food', 'Kula', 146489],
        ['2026-01-04', 'expense', 'Food', 'Klik IDM', 174600],
        ['2026-01-05', 'expense', 'Transportation', 'Bensin', 25000],
        ['2026-01-06', 'expense', 'Food', 'Alfagift', 120600],
        ['2026-01-06', 'expense', 'Food', 'Buah', 10000],
        ['2026-01-06', 'expense', 'Bill', 'Kos', 1600000],
        ['2026-01-08', 'expense', 'Food', 'tatei st', 35000],
        ['2026-01-09', 'expense', 'Food', 'Buah', 10000],
        ['2026-01-09', 'expense', 'Food', 'bola ubi', 15000],
        ['2026-01-10', 'expense', 'Food', 'kula', 102512],
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO transactions (date, type, category, title, amount)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $inserted = 0;
    foreach ($transactions as $tx) {
        $stmt->execute($tx);
        $inserted++;
    }
    
    // Calculate totals
    $incomeStmt = $pdo->query("SELECT SUM(amount) FROM transactions WHERE type = 'income'");
    $totalIncome = $incomeStmt->fetchColumn();
    
    $expenseStmt = $pdo->query("SELECT SUM(amount) FROM transactions WHERE type = 'expense'");
    $totalExpense = $expenseStmt->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'message' => 'Data migrated successfully',
        'inserted' => $inserted,
        'totalIncome' => $totalIncome,
        'totalExpense' => $totalExpense,
        'balance' => $totalIncome - $totalExpense
    ]);
    
} catch (Exception $e) {
    jsonResponse(['error' => 'Migration failed: ' . $e->getMessage()], 500);
}
