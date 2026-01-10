import React, { createContext, useContext, useState, useMemo } from 'react';
import { INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES } from '../utils/constants';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [isScrolled, setIsScrolled] = useState(false);

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

    // Transaction functions
    const addTransaction = (newTx) => {
        setTransactions([{ ...newTx, id: Date.now() }, ...transactions]);
    };

    const deleteTransaction = (id) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const updateTransaction = (id, updatedTx) => {
        setTransactions(transactions.map(t =>
            t.id === id ? { ...t, ...updatedTx } : t
        ));
    };

    // Category functions - updated to include type
    const addCategory = (name, color, type) => {
        const newCategory = { id: Date.now(), name, color, type };
        setCategories([...categories, newCategory]);
    };

    const updateCategory = (id, name, color, type) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, name, color, type } : cat
        ));
    };

    const deleteCategory = (id) => {
        setCategories(categories.filter(cat => cat.id !== id));
    };

    const value = {
        transactions,
        categories,
        stats,
        catColors,
        isScrolled,
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
