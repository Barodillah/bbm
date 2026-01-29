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

    // GET - Get all knowledge
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute('SELECT * FROM ai_knowledge ORDER BY created_at DESC');
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // POST - Create knowledge
    if (req.method === 'POST') {
        try {
            const { title, content, category } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Content is required' });
            }
            const [result] = await pool.execute(
                'INSERT INTO ai_knowledge (title, content, category) VALUES (?, ?, ?)',
                [title?.trim() || null, content.trim(), category?.trim() || null]
            );
            return res.status(201).json({
                id: result.insertId,
                title: title?.trim() || null,
                content: content.trim(),
                category: category?.trim() || null
            });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // PUT - Update knowledge
    if (req.method === 'PUT') {
        try {
            const { title, content, category } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Content is required' });
            }
            await pool.execute(
                'UPDATE ai_knowledge SET title = ?, content = ?, category = ? WHERE id = ?',
                [title?.trim() || null, content.trim(), category?.trim() || null, id]
            );
            return res.status(200).json({
                success: true,
                id,
                title: title?.trim() || null,
                content: content.trim(),
                category: category?.trim() || null
            });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // DELETE - Delete knowledge
    if (req.method === 'DELETE') {
        try {
            await pool.execute('DELETE FROM ai_knowledge WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
