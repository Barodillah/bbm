import getPool from './db.js';

const AI_MODEL = 'google/gemini-2.5-flash-lite';

async function callOpenRouter(systemPrompt, userMessage) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.API_URL || 'http://localhost:3001',
                'X-Title': 'BBM - Budget By Me'
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

// ===== FUNGSI UNTUK MENGAMBIL DATA PASAR =====
async function getMarketData() {
    const marketData = {
        gold: null,
        btc: null,
        ihsg: null,
        usdIdr: null
    };

    // Ambil kurs USD ke IDR dari exchangerate-api (gratis)
    try {
        const usdResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            signal: AbortSignal.timeout(5000)
        });
        if (usdResponse.ok) {
            const usdData = await usdResponse.json();
            marketData.usdIdr = usdData.rates?.IDR || 16000;
        }
    } catch (e) {
        marketData.usdIdr = 16000; // Default fallback
    }

    // Ambil harga emas dari goldapi.io (free tier)
    try {
        const goldResponse = await fetch('https://www.goldapi.io/api/XAU/USD', {
            headers: {
                'x-access-token': 'goldapi-demo', // Demo token untuk testing
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
        });
        if (goldResponse.ok) {
            const goldData = await goldResponse.json();
            if (goldData.price) {
                marketData.gold = {
                    priceUSD: goldData.price,
                    priceIDR: goldData.price * marketData.usdIdr,
                    change: goldData.ch || 0,
                    changePercent: goldData.chp || 0
                };
            }
        }
    } catch (e) {
        // Fallback: coba API lain
        try {
            const altGoldResponse = await fetch('https://api.metals.live/v1/spot/gold', {
                signal: AbortSignal.timeout(5000)
            });
            if (altGoldResponse.ok) {
                const altGoldData = await altGoldResponse.json();
                if (altGoldData && altGoldData[0]) {
                    marketData.gold = {
                        priceUSD: altGoldData[0].price,
                        priceIDR: altGoldData[0].price * marketData.usdIdr,
                        change: 0,
                        changePercent: 0
                    };
                }
            }
        } catch (e2) {
            console.log('Gold API failed:', e2.message);
        }
    }

    // Ambil harga Bitcoin dari CoinDesk API (free, no key)
    try {
        const btcResponse = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json', {
            signal: AbortSignal.timeout(5000)
        });
        if (btcResponse.ok) {
            const btcData = await btcResponse.json();
            const btcUSD = btcData.bpi?.USD?.rate_float;
            if (btcUSD) {
                marketData.btc = {
                    priceUSD: btcUSD,
                    priceIDR: btcUSD * marketData.usdIdr,
                    updatedAt: btcData.time?.updated
                };
            }
        }
    } catch (e) {
        // Fallback: Coinbase API
        try {
            const altBtcResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
                signal: AbortSignal.timeout(5000)
            });
            if (altBtcResponse.ok) {
                const altBtcData = await altBtcResponse.json();
                const btcUSD = parseFloat(altBtcData.data?.amount);
                if (btcUSD) {
                    marketData.btc = {
                        priceUSD: btcUSD,
                        priceIDR: btcUSD * marketData.usdIdr
                    };
                }
            }
        } catch (e2) {
            console.log('BTC API failed:', e2.message);
        }
    }

    // Ambil data IHSG dari Yahoo Finance (gratis)
    try {
        const ihsgResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE?interval=1d&range=5d', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            signal: AbortSignal.timeout(5000)
        });
        if (ihsgResponse.ok) {
            const ihsgData = await ihsgResponse.json();
            const result = ihsgData.chart?.result?.[0];
            if (result) {
                const meta = result.meta;
                const quote = result.indicators?.quote?.[0];
                const closes = quote?.close?.filter(c => c !== null);

                if (closes && closes.length > 0) {
                    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
                    const prevClose = meta.chartPreviousClose || closes[closes.length - 2];
                    const change = currentPrice - prevClose;
                    const changePercent = (change / prevClose) * 100;

                    marketData.ihsg = {
                        price: currentPrice,
                        previousClose: prevClose,
                        change: change,
                        changePercent: changePercent
                    };
                }
            }
        }
    } catch (e) {
        console.log('IHSG API failed:', e.message);
    }

    return marketData;
}

// ===== FUNGSI UNTUK MENGAMBIL KNOWLEDGE BASE =====
async function getKnowledgeBase(pool) {
    try {
        // Check if table exists first
        const [tables] = await pool.execute("SHOW TABLES LIKE 'ai_knowledge'");
        if (tables.length === 0) {
            return []; // Table doesn't exist, return empty array
        }
        // Use SELECT * for flexibility with different column structures
        const [rows] = await pool.execute('SELECT * FROM ai_knowledge ORDER BY created_at DESC');
        return rows;
    } catch (err) {
        console.error('Error getting knowledge base:', err.message);
        return [];
    }
}

// ===== FUNGSI UNTUK MENGAMBIL DATA WALLET =====
async function getWalletContext(pool) {
    try {
        const [wallets] = await pool.execute(`
            SELECT id, name, type, balance, initial_balance
            FROM wallets 
            WHERE is_active = 1 
            ORDER BY created_at ASC
        `);

        // Hitung total saldo semua wallet
        const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);

        // Group wallets by type
        const walletsByType = {
            bank: wallets.filter(w => w.type === 'bank'),
            ewallet: wallets.filter(w => w.type === 'ewallet'),
            cash: wallets.filter(w => w.type === 'cash'),
            credit: wallets.filter(w => w.type === 'credit'),
            investment: wallets.filter(w => w.type === 'investment')
        };

        // Top up dan transfer terakhir (from wallet transactions)
        const [recentWalletTx] = await pool.execute(`
            SELECT t.title, t.amount, t.type, t.date, w.name as wallet_name
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE t.category IN ('Top Up', 'Transfer')
            ORDER BY t.date DESC, t.created_at DESC
            LIMIT 5
        `);

        return {
            wallets,
            totalBalance,
            walletsByType,
            recentWalletTransactions: recentWalletTx
        };
    } catch (err) {
        console.error('Error getting wallet context:', err);
        return null;
    }
}

// ===== FUNGSI UNTUK MENGAMBIL DATA KATEGORI =====
async function getCategoriesContext(pool) {
    try {
        const [categories] = await pool.execute(`
            SELECT name, type, color FROM categories ORDER BY name
        `);
        return categories;
    } catch (err) {
        console.error('Error getting categories:', err);
        return [];
    }
}

async function getTransactionContext(pool) {
    try {
        const baseFilter = "category != 'Transfer'";

        // ===== 1. DATA SKALAR (Hari Ini, Minggu Ini, Bulan Ini, Bulan Lalu) =====
        // Helper to run query with base filter
        const getSummary = async (dateCondition) => {
            const [rows] = await pool.execute(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
                    COUNT(*) as total_transactions
                FROM transactions
                WHERE ${baseFilter} AND ${dateCondition}
            `);
            return rows[0];
        };

        const todaySummary = await getSummary("DATE(date) = CURDATE()");
        const weekSummary = await getSummary("date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
        const thisMonthSummary = await getSummary("MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())");
        const lastMonthSummary = await getSummary("MONTH(date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))");
        const allTimeSummary = await getSummary("1=1");

        // First transaction date for all-time context
        const [firstTx] = await pool.execute(`SELECT MIN(date) as dt FROM transactions WHERE ${baseFilter}`);
        allTimeSummary.first_transaction_date = firstTx[0]?.dt;

        // ===== 2. TRANSAKSI DETAIL =====

        // Hari Ini
        const [todayTransactions] = await pool.execute(`
            SELECT title, amount, type, category, TIME_FORMAT(created_at, '%H:%i') as jam
            FROM transactions
            WHERE ${baseFilter} AND DATE(date) = CURDATE()
            ORDER BY created_at DESC
        `);

        // 30 Hari Terakhir (NEW)
        const [last30DaysTransactions] = await pool.execute(`
            SELECT t.title, t.amount, t.type, t.category, DATE_FORMAT(t.date, '%d %b %Y') as tanggal, w.name as wallet_name
            FROM transactions t
            LEFT JOIN wallets w ON t.wallet_id = w.id
            WHERE t.category != 'Transfer' AND t.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY t.date DESC, t.created_at DESC
        `);

        // ===== 3. RATA-RATA BULANAN (ANALYSIS PAGE LOGIC) =====

        // A. Hitung jumlah bulan unik
        const [uniqueMonthsRes] = await pool.execute(`
            SELECT COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as count 
            FROM transactions 
            WHERE ${baseFilter}
        `);
        const totalMonths = uniqueMonthsRes[0].count || 1;

        // B. Total per kategori (All Time)
        const [categoryTotals] = await pool.execute(`
            SELECT category, type, SUM(amount) as total_amount
            FROM transactions
            WHERE ${baseFilter}
            GROUP BY category, type
        `);

        // C. Total per kategori (Bulan Ini) - untuk perbandingan
        const [currentMonthTotals] = await pool.execute(`
            SELECT category, SUM(amount) as current_amount
            FROM transactions
            WHERE ${baseFilter} AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
            GROUP BY category
        `);

        // Map current month data for easy lookup
        const currentMonthMap = currentMonthTotals.reduce((acc, curr) => {
            acc[curr.category] = curr.current_amount;
            return acc;
        }, {});

        // D. Build Average Analysis Data
        const averageAnalysis = categoryTotals.map(cat => {
            const average = cat.total_amount / totalMonths;
            const currentAmount = currentMonthMap[cat.category] || 0;
            const percentDiff = average > 0 ? ((currentAmount - average) / average) * 100 : 0;

            return {
                category: cat.category,
                type: cat.type,
                average: average,
                current: currentAmount,
                percentDiff: percentDiff
            };
        });

        // Split into income and expense analysis
        const expenseAnalysis = averageAnalysis.filter(a => a.type === 'expense').sort((a, b) => b.average - a.average);
        const incomeAnalysis = averageAnalysis.filter(a => a.type === 'income').sort((a, b) => b.average - a.average);

        // Calculate Total Averages
        const totalAverageExpense = expenseAnalysis.reduce((sum, item) => sum + item.average, 0);
        const totalAverageIncome = incomeAnalysis.reduce((sum, item) => sum + item.average, 0);


        // ===== 4. BREAKDOWN & TRENDS =====

        // Data Breakdown 7 Hari
        const [dailyBreakdown] = await pool.execute(`
            SELECT 
                DATE_FORMAT(date, '%a %d %b') as hari,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as pengeluaran,
                COUNT(*) as jumlah_transaksi
            FROM transactions
            WHERE ${baseFilter} AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date DESC
        `);

        // Trend 3 Bulan
        const [monthlyTrend] = await pool.execute(`
            SELECT 
                DATE_FORMAT(date, '%M %Y') as bulan,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as pengeluaran,
                COUNT(*) as jumlah_transaksi
            FROM transactions
            WHERE ${baseFilter} AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY YEAR(date), MONTH(date)
            ORDER BY YEAR(date) DESC, MONTH(date) DESC
            LIMIT 3
        `);

        // Transaksi Terbesar Bulan Ini
        const [biggestExpense] = await pool.execute(`
            SELECT title, amount, category, DATE_FORMAT(date, '%d %b') as tanggal
            FROM transactions
            WHERE ${baseFilter} AND type = 'expense' 
            AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
            ORDER BY amount DESC LIMIT 1
        `);
        const [biggestIncome] = await pool.execute(`
            SELECT title, amount, category, DATE_FORMAT(date, '%d %b') as tanggal
            FROM transactions
            WHERE ${baseFilter} AND type = 'income' 
            AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
            ORDER BY amount DESC LIMIT 1
        `);


        return {
            thisMonth: thisMonthSummary,
            lastMonth: lastMonthSummary,
            today: {
                summary: todaySummary,
                transactions: todayTransactions
            },
            week: {
                summary: weekSummary,
                dailyBreakdown
            },
            analysis: {
                expense: expenseAnalysis, // List of {category, average, current, percentDiff}
                income: incomeAnalysis,
                totalAvgExpense: totalAverageExpense,
                totalAvgIncome: totalAverageIncome
            },
            last30Days: last30DaysTransactions,
            biggest: {
                expense: biggestExpense[0],
                income: biggestIncome[0]
            },
            allTime: allTimeSummary,
            monthlyTrend
        };
    } catch (err) {
        console.error('Error getting transaction context:', err);
        return null; // Don't crash the whole app, just return limited context
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

            // Ambil semua data yang diperlukan
            const [context, walletContext, knowledgeBase, categories, marketData] = await Promise.all([
                getTransactionContext(pool),
                getWalletContext(pool),
                getKnowledgeBase(pool),
                getCategoriesContext(pool),
                getMarketData()
            ]);

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

            // Format knowledge base untuk prompt
            let knowledgeSection = '';
            if (knowledgeBase && knowledgeBase.length > 0) {
                knowledgeSection = `
══════════════════════════════════════
📚 ACUAN FINANSIAL (Asas atau Aturan yang dianut Barod)
══════════════════════════════════════
${knowledgeBase.map(k => `
📌 ${k.title || 'Acuan'}${k.category ? ` [${k.category}]` : ''}
${k.content}
`).join('\n──────────────────────────────────────\n')}
══════════════════════════════════════`;
            }

            // Format wallet section untuk prompt
            let walletSection = '';
            if (walletContext && walletContext.wallets.length > 0) {
                walletSection = `
══════════════════════════════════════
💰 DATA WALLET BAROD
══════════════════════════════════════
💳 TOTAL SALDO SEMUA WALLET: Rp ${walletContext.totalBalance.toLocaleString('id-ID')}
📊 Jumlah Wallet Aktif: ${walletContext.wallets.length}

${walletContext.walletsByType.bank?.length > 0 ? `
🏦 REKENING BANK:
${walletContext.walletsByType.bank.map(w => `   • ${w.name}: Rp ${parseFloat(w.balance).toLocaleString('id-ID')}`).join('\n')}
` : ''}
${walletContext.walletsByType.ewallet?.length > 0 ? `
📱 E-WALLET:
${walletContext.walletsByType.ewallet.map(w => `   • ${w.name}: Rp ${parseFloat(w.balance).toLocaleString('id-ID')}`).join('\n')}
` : ''}
${walletContext.walletsByType.cash?.length > 0 ? `
💵 UANG TUNAI:
${walletContext.walletsByType.cash.map(w => `   • ${w.name}: Rp ${parseFloat(w.balance).toLocaleString('id-ID')}`).join('\n')}
` : ''}
${walletContext.walletsByType.credit?.length > 0 ? `
💳 KARTU KREDIT:
${walletContext.walletsByType.credit.map(w => `   • ${w.name}: Rp ${parseFloat(w.balance).toLocaleString('id-ID')}`).join('\n')}
` : ''}
${walletContext.walletsByType.investment?.length > 0 ? `
📈 INVESTASI:
${walletContext.walletsByType.investment.map(w => `   • ${w.name}: Rp ${parseFloat(w.balance).toLocaleString('id-ID')}`).join('\n')}
` : ''}
${walletContext.recentWalletTransactions?.length > 0 ? `
🔄 TRANSAKSI WALLET TERAKHIR (Top Up/Transfer):
${walletContext.recentWalletTransactions.map(t => `   • ${t.title} - ${t.wallet_name}: Rp ${parseFloat(t.amount).toLocaleString('id-ID')} (${t.type === 'income' ? '📈' : '📉'})`).join('\n')}
` : ''}
══════════════════════════════════════`;
            }

            // Format categories section
            let categoriesSection = '';
            if (categories && categories.length > 0) {
                const expenseCategories = categories.filter(c => c.type === 'expense');
                const incomeCategories = categories.filter(c => c.type === 'income');
                categoriesSection = `
══════════════════════════════════════
🏷️ KATEGORI YANG TERSEDIA
══════════════════════════════════════
📉 Kategori Pengeluaran: ${expenseCategories.map(c => c.name).join(', ')}
📈 Kategori Pemasukan: ${incomeCategories.map(c => c.name).join(', ')}
══════════════════════════════════════`;
            }

            const systemPrompt = `Kamu adalah **BABA**, asisten keuangan pribadi sekaligus Financial Advisor untuk **Kanjeng Jihan Mutia**. 
Selalu panggil user dengan nama "Barod" dalam percakapan.

📋 PERAN KAMU:
1. **Financial Advisor Profesional** - Kamu adalah ahli keuangan yang berpengalaman. Bisa menjawab pertanyaan seputar:
   - Investasi (saham, reksadana, obligasi, crypto, emas, properti)
   - Perencanaan keuangan & budgeting
   - Menabung & dana darurat
   - Manajemen utang & cicilan
   - Asuransi & proteksi finansial
   - Pajak & perencanaan pensiun
   - Tips hemat & cara mengelola uang
   
2. **Personal Money Manager** - Menganalisis data keuangan pribadi Barod dan memberikan insight
3. **Acuan Finansial** - Kamu memberikan Advice berdasarkan Acuan Finansial yang telah diatur

💡 GAYA KOMUNIKASI:
- Santai, hangat, dan suportif seperti teman dekat 💕
- Gunakan emoji untuk membuat percakapan lebih hidup
- Jelaskan konsep keuangan dengan bahasa sederhana yang mudah dipahami
- Berikan contoh konkret dan actionable tips
- Jika Barod tanya hal di luar keuangan, tetap ramah dan arahkan kembali ke topik finansial
- Gunakan data dari Knowledge Base jika relevan dengan pertanyaan Barod

🕐 WAKTU SEKARANG (Jakarta/WIB):
${waktuJakarta}

${knowledgeSection}

${walletSection}

${context ? `
══════════════════════════════════════
📊 DATA KEUANGAN LENGKAP BAROD
══════════════════════════════════════

📅 HARI INI:
- Pemasukan: Rp ${(context.today?.summary?.total_income || 0).toLocaleString('id-ID')}
- Pengeluaran: Rp ${(context.today?.summary?.total_expense || 0).toLocaleString('id-ID')}
- Jumlah Transaksi: ${context.today?.summary?.total_transactions || 0}
${context.today?.transactions?.length > 0 ? `
📝 Detail Transaksi Hari Ini:
${context.today.transactions.map(t => `   • [${t.jam}] ${t.title}: Rp ${t.amount.toLocaleString('id-ID')} (${t.type === 'income' ? '📈 Masuk' : '📉 Keluar'} - ${t.category})`).join('\n')}
` : '   Belum ada transaksi hari ini'}

──────────────────────────────────────
📈 BULAN INI vs RATA-RATA HISTORIS (ANALISIS):

💰 TOTAL RATA-RATA BULANAN:
- Rata-rata Pemasukan: Rp ${Math.round(context.analysis?.totalAvgIncome || 0).toLocaleString('id-ID')} / bulan
- Rata-rata Pengeluaran: Rp ${Math.round(context.analysis?.totalAvgExpense || 0).toLocaleString('id-ID')} / bulan

📊 PERFORMA KATEGORI (Bulan Ini vs Rata-rata):
${context.analysis?.expense?.length > 0 ? `📉 PENGELUARAN:` : ''}
${context.analysis?.expense?.map(c => `   • ${c.category}:
     - Rata-rata: Rp ${Math.round(c.average).toLocaleString('id-ID')}
     - Bulan Ini: Rp ${Math.round(c.current).toLocaleString('id-ID')}
     - Status: ${c.percentDiff > 0 ? `⚠️ Lebih boros ${c.percentDiff.toFixed(0)}%` : `✅ Lebih hemat ${Math.abs(c.percentDiff).toFixed(0)}%`}`).join('\n')}

${context.analysis?.income?.length > 0 ? `📈 PEMASUKAN:` : ''}
${context.analysis?.income?.map(c => `   • ${c.category}:
     - Rata-rata: Rp ${Math.round(c.average).toLocaleString('id-ID')}
     - Bulan Ini: Rp ${Math.round(c.current).toLocaleString('id-ID')}
     - Status: ${c.percentDiff > 0 ? `🚀 Naik ${c.percentDiff.toFixed(0)}%` : `🔻 Turun ${Math.abs(c.percentDiff).toFixed(0)}%`}`).join('\n')}

──────────────────────────────────────
📊 RINGKASAN BULAN INI:
- Total Pemasukan: Rp ${(context.thisMonth?.total_income || 0).toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${(context.thisMonth?.total_expense || 0).toLocaleString('id-ID')}
- Saldo Bulan Ini: Rp ${((context.thisMonth?.total_income || 0) - (context.thisMonth?.total_expense || 0)).toLocaleString('id-ID')}
- Jumlah Transaksi: ${context.thisMonth?.total_transactions || 0}

📊 PERBANDINGAN DENGAN BULAN LALU:
- Pemasukan Bulan Lalu: Rp ${(context.lastMonth?.total_income || 0).toLocaleString('id-ID')}
- Pengeluaran Bulan Lalu: Rp ${(context.lastMonth?.total_expense || 0).toLocaleString('id-ID')}

${context.biggest?.expense ? `
🔥 PENGELUARAN TERBESAR BULAN INI:
   ${context.biggest.expense.title}: Rp ${context.biggest.expense.amount.toLocaleString('id-ID')} (${context.biggest.expense.category}) - ${context.biggest.expense.tanggal}
` : ''}

──────────────────────────────────────
🗓️ RIWAYAT TRANSAKSI (30 HARI TERAKHIR):
${context.last30Days?.map(t => `• ${t.tanggal} - ${t.title}: Rp ${t.amount.toLocaleString('id-ID')} (${t.type === 'income' ? '📈' : '📉'} ${t.category})${t.wallet_name ? ` [${t.wallet_name}]` : ''}`).join('\n') || 'Belum ada transaksi'}

──────────────────────────────────────
🏦 RINGKASAN ALL-TIME:
- Saldo Bersih All-Time: Rp ${((context.allTime?.total_income || 0) - (context.allTime?.total_expense || 0)).toLocaleString('id-ID')}
- Total Transaksi: ${context.allTime?.total_transactions || 0}
${context.allTime?.first_transaction_date ? `- Mulai Tercatat Sejak: ${new Date(context.allTime.first_transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}

══════════════════════════════════════
` : 'Belum ada data keuangan.'}

${categoriesSection}

══════════════════════════════════════
📈 DATA PASAR HARI INI (REAL-TIME)
══════════════════════════════════════
${marketData.usdIdr ? `
💵 KURS USD/IDR: Rp ${Math.round(marketData.usdIdr).toLocaleString('id-ID')}
` : ''}
${marketData.gold ? `
🥇 HARGA EMAS (XAU):
- Per Troy Ounce: $${marketData.gold.priceUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} (Rp ${Math.round(marketData.gold.priceIDR).toLocaleString('id-ID')})
- Per Gram: ~Rp ${Math.round(marketData.gold.priceIDR / 31.1035).toLocaleString('id-ID')}
${marketData.gold.changePercent ? `- Perubahan: ${marketData.gold.changePercent >= 0 ? '📈' : '📉'} ${marketData.gold.changePercent.toFixed(2)}%` : ''}
` : '- Harga Emas: Data tidak tersedia'}

${marketData.btc ? `
₿ BITCOIN (BTC):
- Harga: $${marketData.btc.priceUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} (Rp ${Math.round(marketData.btc.priceIDR).toLocaleString('id-ID')})
` : '- Bitcoin: Data tidak tersedia'}

${marketData.ihsg ? `
📊 IHSG (Indeks Harga Saham Gabungan):
- Harga: ${marketData.ihsg.price.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
- Perubahan: ${marketData.ihsg.change >= 0 ? '📈' : '📉'} ${marketData.ihsg.change.toFixed(2)} (${marketData.ihsg.changePercent.toFixed(2)}%)
- Penutupan Sebelumnya: ${marketData.ihsg.previousClose.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
` : '- IHSG: Data tidak tersedia (pasar tutup atau error)'}

══════════════════════════════════════`;

            const aiResponse = await callOpenRouter(systemPrompt, message);

            if (aiResponse.error) {
                return res.status(200).json({
                    response: 'Maaf Barod, ada kendala pada sistem. Coba lagi ya! 🙏'
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
