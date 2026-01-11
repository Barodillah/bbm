// Vercel Serverless Function for AI Chat
import mysql from 'mysql2/promise';

const dbConfig = {
    host: '153.92.15.23',
    port: 3306,
    user: 'u444914729_jjm',
    password: 'Sagala.4321',
    database: 'u444914729_jjm'
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = 'xiaomi/mimo-v2-flash:free';

async function getConnection() {
    return mysql.createConnection(dbConfig);
}

async function callOpenRouter(systemPrompt, userMessage) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://jejemoney.vercel.app',
            'X-Title': 'JJM - Jurnal Jeje Money'
        },
        body: JSON.stringify({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ]
        })
    });
    return response.json();
}

// Get recent transaction data for context
async function getTransactionContext(conn) {
    try {
        // Get summary stats
        const [summary] = await conn.execute(`
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        `);

        // Get category breakdown
        const [categories] = await conn.execute(`
            SELECT category, type, SUM(amount) as total, COUNT(*) as count
            FROM transactions
            WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
            GROUP BY category, type
            ORDER BY total DESC
            LIMIT 10
        `);

        // Get recent transactions
        const [recent] = await conn.execute(`
            SELECT title, amount, type, category, DATE_FORMAT(date, '%d %b %Y') as tanggal
            FROM transactions
            ORDER BY date DESC, created_at DESC
            LIMIT 10
        `);

        // Get today's transactions
        const [today] = await conn.execute(`
            SELECT title, amount, type, category
            FROM transactions
            WHERE DATE(date) = CURDATE()
        `);

        return {
            summary: summary[0],
            categories,
            recent,
            today
        };
    } catch (err) {
        console.error('Error getting context:', err);
        return null;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let conn;
    try {
        conn = await getConnection();

        if (req.method === 'GET') {
            const [rows] = await conn.execute(
                'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50'
            );
            return res.status(200).json(rows.reverse());
        }

        if (req.method === 'POST') {
            const { message } = req.body;

            // Save user message
            await conn.execute(
                'INSERT INTO chat_messages (role, content) VALUES (?, ?)',
                ['user', message]
            );

            // Get transaction context
            const context = await getTransactionContext(conn);

            const systemPrompt = `Kamu adalah asisten keuangan pribadi bernama JJ untuk **Kanjeng Jihan Mutia**. 
Selalu panggil user dengan nama "Jeje" dalam percakapan.

Kamu membantu Jeje mengelola keuangan dengan ramah, profesional, dan penuh perhatian.
Jawab dengan singkat, hangat, dan gunakan emoji. 💕

DATA KEUANGAN JEJE BULAN INI:
${context ? `
📊 RINGKASAN:
- Total Pemasukan: Rp ${(context.summary?.total_income || 0).toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${(context.summary?.total_expense || 0).toLocaleString('id-ID')}
- Saldo: Rp ${((context.summary?.total_income || 0) - (context.summary?.total_expense || 0)).toLocaleString('id-ID')}
- Jumlah Transaksi: ${context.summary?.total_transactions || 0}

📂 KATEGORI:
${context.categories?.map(c => `- ${c.category} (${c.type}): Rp ${Number(c.total).toLocaleString('id-ID')} (${c.count}x)`).join('\n') || 'Belum ada data'}

📝 TRANSAKSI TERAKHIR:
${context.recent?.map(t => `- ${t.tanggal}: ${t.title} - Rp ${Number(t.amount).toLocaleString('id-ID')} (${t.type === 'income' ? '💰' : '💸'} ${t.category})`).join('\n') || 'Belum ada transaksi'}

📅 TRANSAKSI HARI INI:
${context.today?.length ? context.today.map(t => `- ${t.title}: Rp ${Number(t.amount).toLocaleString('id-ID')} (${t.type === 'income' ? '💰' : '💸'})`).join('\n') : 'Belum ada transaksi hari ini'}
` : 'Belum ada data keuangan.'}

Berikan jawaban yang relevan dan personal berdasarkan data di atas. Jika Jeje bertanya tentang keuangan, gunakan data yang tersedia.`;

            // Single AI call with full context
            const aiResponse = await callOpenRouter(systemPrompt, message);

            if (aiResponse.error) {
                console.error('OpenRouter Error:', aiResponse.error);
                return res.status(200).json({
                    response: 'Maaf Jeje, ada kendala pada sistem. Coba lagi ya! 🙏'
                });
            }

            const aiMessage = aiResponse.choices?.[0]?.message?.content;

            if (!aiMessage) {
                return res.status(200).json({
                    response: 'Maaf Jeje, tidak ada respon. Coba lagi ya! 🙏'
                });
            }

            // Save AI response
            await conn.execute(
                'INSERT INTO chat_messages (role, content) VALUES (?, ?)',
                ['assistant', aiMessage]
            );

            return res.status(200).json({ response: aiMessage });
        }

        if (req.method === 'DELETE') {
            await conn.execute('DELETE FROM chat_messages');
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    } finally {
        if (conn) await conn.end();
    }
}
