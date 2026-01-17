import getPool from './db.js';

const AI_MODEL = 'xiaomi/mimo-v2-flash:free';

async function callOpenRouter(systemPrompt, userMessage) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.API_URL || 'http://localhost:3001',
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

        const data = await response.json();
        return data;
    } catch (e) {
        return { error: { message: e.message } };
    }
}

async function getTransactionContext(pool) {
    try {
        const [summary] = await pool.execute(`
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        `);

        const [categories] = await pool.execute(`
            SELECT category, type, SUM(amount) as total, COUNT(*) as count
            FROM transactions
            WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
            GROUP BY category, type
            ORDER BY total DESC
            LIMIT 10
        `);

        const [recent] = await pool.execute(`
            SELECT title, amount, type, category, DATE_FORMAT(date, '%d %b %Y') as tanggal
            FROM transactions
            ORDER BY date DESC, created_at DESC
            LIMIT 10
        `);

        const [today] = await pool.execute(`
            SELECT title, amount, type, category
            FROM transactions
            WHERE DATE(date) = CURDATE()
        `);

        return { summary: summary[0], categories, recent, today };
    } catch (err) {
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

    const pool = getPool();

    // GET - Get chat history
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50'
            );
            return res.status(200).json(rows.reverse());
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // POST - Send message
    if (req.method === 'POST') {
        try {
            const { message } = req.body;

            await pool.execute(
                'INSERT INTO chat_messages (role, content) VALUES (?, ?)',
                ['user', message]
            );

            const context = await getTransactionContext(pool);

            // Dapatkan waktu Jakarta (WIB - UTC+7)
            const now = new Date();
            const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const waktuJakarta = jakartaTime.toLocaleDateString('id-ID', options);

            const systemPrompt = `Kamu adalah **BABA**, asisten keuangan pribadi sekaligus Financial Advisor untuk **Kanjeng Jihan Mutia**. 
Selalu panggil user dengan nama "Jeje" dalam percakapan.

📋 PERAN KAMU:
1. **Financial Advisor Profesional** - Kamu adalah ahli keuangan yang berpengalaman. Bisa menjawab pertanyaan seputar:
   - Investasi (saham, reksadana, obligasi, crypto, emas, properti)
   - Perencanaan keuangan & budgeting
   - Menabung & dana darurat
   - Manajemen utang & cicilan
   - Asuransi & proteksi finansial
   - Pajak & perencanaan pensiun
   - Tips hemat & cara mengelola uang
   
2. **Personal Money Manager** - Menganalisis data keuangan pribadi Jeje dan memberikan insight

💡 GAYA KOMUNIKASI:
- Santai, hangat, dan suportif seperti teman dekat 💕
- Gunakan emoji untuk membuat percakapan lebih hidup
- Jelaskan konsep keuangan dengan bahasa sederhana yang mudah dipahami
- Berikan contoh konkret dan actionable tips
- Jika Jeje tanya hal di luar keuangan, tetap ramah dan arahkan kembali ke topik finansial

🕐 WAKTU SEKARANG (Jakarta/WIB):
${waktuJakarta}

📊 DATA KEUANGAN JEJE BULAN INI:
${context ? `
- Total Pemasukan: Rp ${(context.summary?.total_income || 0).toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${(context.summary?.total_expense || 0).toLocaleString('id-ID')}
- Saldo: Rp ${((context.summary?.total_income || 0) - (context.summary?.total_expense || 0)).toLocaleString('id-ID')}

📝 Transaksi Terakhir:
${context.recent?.slice(0, 5).map(t => `- ${t.title}: Rp ${t.amount.toLocaleString('id-ID')} (${t.type === 'income' ? '📈' : '📉'} ${t.category})`).join('\n') || 'Belum ada transaksi'}
` : 'Belum ada data keuangan.'}`;

            const aiResponse = await callOpenRouter(systemPrompt, message);

            if (aiResponse.error) {
                return res.status(200).json({
                    response: 'Maaf Jeje, ada kendala pada sistem. Coba lagi ya! 🙏'
                });
            }

            const aiMessage = aiResponse.choices?.[0]?.message?.content || 'Maaf, tidak ada respon.';

            await pool.execute(
                'INSERT INTO chat_messages (role, content) VALUES (?, ?)',
                ['assistant', aiMessage]
            );

            return res.status(200).json({ response: aiMessage });

        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    // DELETE - Clear history
    if (req.method === 'DELETE') {
        try {
            await pool.execute('DELETE FROM chat_messages');
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
