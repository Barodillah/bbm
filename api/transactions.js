// Vercel Serverless Function for Transactions
import mysql from 'mysql2/promise';

const dbConfig = {
    host: '153.92.15.23',
    port: 3306,
    user: 'u444914729_jjm',
    password: 'Sagala.4321',
    database: 'u444914729_jjm'
};

async function getConnection() {
    return mysql.createConnection(dbConfig);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let conn;
    try {
        conn = await getConnection();

        if (req.method === 'GET') {
            const [rows] = await conn.execute('SELECT * FROM transactions ORDER BY date DESC, id DESC');
            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { title, amount, category, type, date } = req.body;
            const [result] = await conn.execute(
                'INSERT INTO transactions (title, amount, category, type, date) VALUES (?, ?, ?, ?, ?)',
                [title, amount, category, type, date]
            );
            return res.status(201).json({ id: result.insertId, title, amount, category, type, date });
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { title, amount, category, type, date } = req.body;
            await conn.execute(
                'UPDATE transactions SET title = ?, amount = ?, category = ?, type = ?, date = ? WHERE id = ?',
                [title, amount, category, type, date, id]
            );
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            await conn.execute('DELETE FROM transactions WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    } finally {
        if (conn) await conn.end();
    }
}
