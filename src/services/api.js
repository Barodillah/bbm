/**
 * API Service Layer
 * Handles all backend communication
 * Auto-detects environment (local PHP vs Vercel serverless)
 */

// Detect if running on Vercel (no .php extension needed)
const isVercel = typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('.vercel.app'));

const API_BASE = '/api';

// Helper to get correct endpoint path
const getEndpoint = (name) => {
    // On Vercel, use .js serverless functions
    // On local, use .php files
    return isVercel ? `${API_BASE}/${name}` : `${API_BASE}/${name}.php`;
};

/**
 * Transactions API
 */
export const transactionsApi = {
    getAll: async () => {
        const res = await fetch(getEndpoint('transactions'));
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    create: async (transaction) => {
        const res = await fetch(getEndpoint('transactions'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        if (!res.ok) throw new Error('Failed to create transaction');
        return res.json();
    },

    update: async (id, transaction) => {
        const res = await fetch(`${getEndpoint('transactions')}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        if (!res.ok) throw new Error('Failed to update transaction');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${getEndpoint('transactions')}?id=${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete transaction');
        return res.json();
    }
};

/**
 * Categories API
 */
export const categoriesApi = {
    getAll: async () => {
        const res = await fetch(getEndpoint('categories'));
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    create: async (category) => {
        const res = await fetch(getEndpoint('categories'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    },

    update: async (id, category) => {
        const res = await fetch(`${getEndpoint('categories')}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${getEndpoint('categories')}?id=${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete category');
        return res.json();
    }
};

/**
 * AI Chat API
 */
export const chatApi = {
    sendMessage: async (message, context = '') => {
        const res = await fetch(getEndpoint('chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context })
        });
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
    },

    getHistory: async () => {
        const res = await fetch(getEndpoint('chat'));
        if (!res.ok) throw new Error('Failed to fetch chat history');
        return res.json();
    },

    clearHistory: async () => {
        const res = await fetch(getEndpoint('chat'), { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to clear chat history');
        return res.json();
    }
};

/**
 * Run database migration
 */
export const runMigration = async () => {
    const res = await fetch(getEndpoint('migrate'));
    return res.json();
};

/**
 * Auth API
 */
export const authApi = {
    login: async (pin) => {
        const res = await fetch(getEndpoint('auth'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        return res.json();
    },

    changePin: async (currentPin, newPin) => {
        const res = await fetch(getEndpoint('auth'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPin, newPin })
        });
        return res.json();
    }
};
