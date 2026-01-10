import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { transactionsApi, categoriesApi } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data from API on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [txData, catData] = await Promise.all([
                    transactionsApi.getAll(),
                    categoriesApi.getAll()
                ]);
                setTransactions(txData);
                setCategories(catData);
                setError(null);
            } catch (err) {
                console.error('Failed to load data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Computed stats
    const stats = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += t.amount;
                acc.totalBalance += t.amount;
            } else {
                acc.totalExpense += t.amount;
                acc.totalBalance -= t.amount;
            }
            return acc;
        }, { totalBalance: 0, totalIncome: 0, totalExpense: 0 });
    }, [transactions]);

    // Category color mapping
    const catColors = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat.color;
            return acc;
        }, {});
    }, [categories]);

    // Transaction functions - now async with API
    const addTransaction = useCallback(async (newTx) => {
        try {
            const created = await transactionsApi.create(newTx);
            setTransactions(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Failed to add transaction:', err);
            throw err;
        }
    }, []);

    const deleteTransaction = useCallback(async (id) => {
        try {
            await transactionsApi.delete(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            throw err;
        }
    }, []);

    const updateTransaction = useCallback(async (id, updatedTx) => {
        try {
            const updated = await transactionsApi.update(id, updatedTx);
            setTransactions(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err) {
            console.error('Failed to update transaction:', err);
            throw err;
        }
    }, []);

    // Category functions - now async with API
    const addCategory = useCallback(async (name, color, type) => {
        try {
            const created = await categoriesApi.create({ name, color, type });
            setCategories(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add category:', err);
            throw err;
        }
    }, []);

    const updateCategory = useCallback(async (id, name, color, type) => {
        try {
            const updated = await categoriesApi.update(id, { name, color, type });
            setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
            return updated;
        } catch (err) {
            console.error('Failed to update category:', err);
            throw err;
        }
    }, []);

    const deleteCategory = useCallback(async (id) => {
        try {
            await categoriesApi.delete(id);
            setCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (err) {
            console.error('Failed to delete category:', err);
            throw err;
        }
    }, []);

    const value = {
        transactions,
        categories,
        stats,
        catColors,
        isScrolled,
        isLoading,
        error,
        setIsScrolled,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
