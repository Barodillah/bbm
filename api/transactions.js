import getPool from './db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const pool = getPool();
    const { id } = req.query;

    // GET - Get all transactions
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute(`
                SELECT t.*, w.name as wallet_name, w.type as wallet_type 
                FROM transactions t 
                LEFT JOIN wallets w ON t.wallet_id = w.id 
                ORDER BY t.date DESC, t.id DESC
            `);
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // POST - Create transaction
    if (req.method === 'POST') {
        try {
            const { title, amount, category, type, date, wallet_id } = req.body;
            const [result] = await pool.execute(
                'INSERT INTO transactions (title, amount, category, type, date, wallet_id) VALUES (?, ?, ?, ?, ?, ?)',
                [title, amount, category, type, date, wallet_id || null]
            );

            // If wallet_id is provided and !skip_balance_update, update wallet balance
            if (wallet_id && !req.body.skip_balance_update) {
                const balanceChange = type === 'income' ? amount : -amount;
                await pool.execute(
                    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                    [balanceChange, wallet_id]
                );
            }

            return res.status(201).json({ id: result.insertId, title, amount, category, type, date, wallet_id });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // PUT - Update transaction
    if (req.method === 'PUT') {
        try {
            const { title, amount, category, type, date, wallet_id } = req.body;

            // Get old transaction to revert wallet balance
            const [oldTx] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
            if (oldTx.length > 0 && oldTx[0].wallet_id) {
                const oldBalanceChange = oldTx[0].type === 'income' ? -oldTx[0].amount : oldTx[0].amount;
                await pool.execute(
                    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                    [oldBalanceChange, oldTx[0].wallet_id]
                );
            }

            // Update transaction
            await pool.execute(
                'UPDATE transactions SET title = ?, amount = ?, category = ?, type = ?, date = ?, wallet_id = ? WHERE id = ?',
                [title, amount, category, type, date, wallet_id || null, id]
            );

            // Apply new wallet balance
            if (wallet_id) {
                const newBalanceChange = type === 'income' ? amount : -amount;
                await pool.execute(
                    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                    [newBalanceChange, wallet_id]
                );
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // DELETE - Delete transaction
    if (req.method === 'DELETE') {
        try {
            // Get transaction to revert wallet balance
            const [oldTx] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
            if (oldTx.length > 0 && oldTx[0].wallet_id) {
                const balanceChange = oldTx[0].type === 'income' ? -oldTx[0].amount : oldTx[0].amount;
                await pool.execute(
                    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                    [balanceChange, oldTx[0].wallet_id]
                );
            }

            await pool.execute('DELETE FROM transactions WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
