import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static routes that work without dynamic imports
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    type: 'GlobalErrorHandler'
  });
});

// Dynamic routes - loaded on first request
let routesLoaded = false;

async function loadRoutes() {
  if (routesLoaded) return;

  try {
    const authModule = await import('./api/auth.js');
    app.use('/api/auth', authModule.default);
    console.log('[Server] Auth route loaded');
  } catch (e) {
    console.error('[Server] Auth import error:', e);
  }

  try {
    const transactionsModule = await import('./api/transactions.js');
    app.use('/api/transactions', transactionsModule.default);
    console.log('[Server] Transactions route loaded');
  } catch (e) {
    console.error('[Server] Transactions import error:', e);
  }

  try {
    const categoriesModule = await import('./api/categories.js');
    app.use('/api/categories', categoriesModule.default);
    console.log('[Server] Categories route loaded');
  } catch (e) {
    console.error('[Server] Categories import error:', e);
  }

  try {
    const chatModule = await import('./api/chat.js');
    app.use('/api/chat', chatModule.default);
    console.log('[Server] Chat route loaded');
  } catch (e) {
    console.error('[Server] Chat import error:', e);
  }

  routesLoaded = true;
}

// Middleware to ensure routes are loaded before API requests
app.use('/api', async (req, res, next) => {
  // Skip for already handled static routes
  if (req.path === '/ping' || req.path === '/health') {
    return next();
  }
  await loadRoutes();
  next();
});

console.log("[Server] App initialized");

export default app;

// Only run server in development
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Load routes immediately for local dev
  loadRoutes().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
}
