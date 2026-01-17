import mysql from 'mysql2/promise';

// Note: In Vercel, env vars are injected automatically
// dotenv is only needed for local development

console.log('[DB] Initializing Pool with:', {
    host: process.env.DB_HOST || 'MISSING',
    user: process.env.DB_USER || 'MISSING',
    db: process.env.DB_NAME || 'MISSING',
    port: process.env.DB_PORT || '3306',
    ssl: process.env.DB_SSL || 'auto'
});

// Validate required env vars
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error('[DB] Missing environment variables:', missingVars);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5, // Lower for serverless
    connectTimeout: 10000, // 10s timeout for cloud DBs
    // Enable SSL for cloud databases
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
