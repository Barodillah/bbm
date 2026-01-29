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

    // GET - Get all wallets
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute('SELECT * FROM wallets WHERE is_active = 1 ORDER BY created_at ASC');
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // POST - Create wallet
    if (req.method === 'POST') {
        try {
            const { name, type, icon, color, initial_balance } = req.body;

            // Use only existing columns in database
            const [result] = await pool.execute(
                'INSERT INTO wallets (name, type, icon, color, balance, initial_balance) VALUES (?, ?, ?, ?, ?, ?)',
                [name, type || 'bank', icon || null, color || '#60A5FA', initial_balance || 0, initial_balance || 0]
            );

            const [newWallet] = await pool.execute('SELECT * FROM wallets WHERE id = ?', [result.insertId]);
            return res.status(201).json(newWallet[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // PUT - Update wallet
    if (req.method === 'PUT') {
        try {
            const { name, type, icon, color, balance } = req.body;
            await pool.execute(
                'UPDATE wallets SET name = ?, type = ?, icon = ?, color = ?, balance = ? WHERE id = ?',
                [name, type, icon, color, balance, id]
            );

            const [updatedWallet] = await pool.execute('SELECT * FROM wallets WHERE id = ?', [id]);
            return res.status(200).json(updatedWallet[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // DELETE - Soft delete wallet (set is_active = 0)
    if (req.method === 'DELETE') {
        try {
            await pool.execute('UPDATE wallets SET is_active = 0 WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
