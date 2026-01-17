
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug - track import errors
const importErrors = {};

// Lazy load handlers to catch errors
let authHandler, transactionsHandler, categoriesHandler, chatHandler;

try {
  authHandler = (await import('./api/auth.js')).default;
  console.log('[Server] Auth loaded successfully');
} catch (e) {
  console.error('[Server] Auth import error:', e);
  importErrors.auth = e.message;
}

try {
  transactionsHandler = (await import('./api/transactions.js')).default;
  console.log('[Server] Transactions loaded successfully');
} catch (e) {
  console.error('[Server] Transactions import error:', e);
  importErrors.transactions = e.message;
}

try {
  categoriesHandler = (await import('./api/categories.js')).default;
  console.log('[Server] Categories loaded successfully');
} catch (e) {
  console.error('[Server] Categories import error:', e);
  importErrors.categories = e.message;
}

try {
  chatHandler = (await import('./api/chat.js')).default;
  console.log('[Server] Chat loaded successfully');
} catch (e) {
  console.error('[Server] Chat import error:', e);
  importErrors.chat = e.message;
}

// Routes - only mount if loaded successfully
if (authHandler) app.use('/api/auth', authHandler);
if (transactionsHandler) app.use('/api/transactions', transactionsHandler);
if (categoriesHandler) app.use('/api/categories', categoriesHandler);
if (chatHandler) app.use('/api/chat', chatHandler);

// Debug endpoint to see import errors
app.get('/api/debug', (req, res) => {
  res.json({
    importErrors,
    handlers: {
      auth: !!authHandler,
      transactions: !!transactionsHandler,
      categories: !!categoriesHandler,
      chat: !!chatHandler
    }
  });
});

// Simple Ping (No DB) - Show Env Status
app.get('/api/ping', (req, res) => {
  res.json({
    pong: true,
    time: new Date().toISOString(),
    env: {
      DB_HOST: !!process.env.DB_HOST ? 'Set' : 'Missing',
      DB_USER: !!process.env.DB_USER ? 'Set' : 'Missing',
      DB_PASS: !!process.env.DB_PASSWORD ? 'Set' : 'Missing',
      DB_NAME: !!process.env.DB_NAME ? 'Set' : 'Missing'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    type: 'GlobalErrorHandler'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const getPool = (await import('./api/db.js')).default;
    const connection = getPool();
    await connection.execute('SELECT 1');
    res.json({ status: 'ok', environment: 'vercel-express', db: 'connected' });
  } catch (error) {
    console.error('Health check db error:', error);
    res.status(500).json({ status: 'error', environment: 'vercel-express', db: 'disconnected', error: error.message });
  }
});

console.log("[Server] App initialized");

export default app;

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
