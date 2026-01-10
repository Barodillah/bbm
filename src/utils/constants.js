// Initial transactions data
export const INITIAL_TRANSACTIONS = [
    { id: 1, title: 'Gaji Bulanan', amount: 15000000, type: 'income', category: 'Work', date: '2023-10-25' },
    { id: 2, title: 'Kopi Kenangan', amount: 45000, type: 'expense', category: 'Food', date: '2023-10-25' },
    { id: 3, title: 'Listrik & Air', amount: 850000, type: 'expense', category: 'Bills', date: '2023-10-24' },
    { id: 4, title: 'Bonus Project', amount: 2500000, type: 'income', category: 'Freelance', date: '2023-10-23' },
    { id: 5, title: 'Makan Malam', amount: 120000, type: 'expense', category: 'Food', date: '2023-10-23' },
    { id: 6, title: 'Bensin Motor', amount: 100000, type: 'expense', category: 'Transport', date: '2023-10-22' },
];

// Default categories with colors and type (expense/income)
export const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Food', color: '#F87171', type: 'expense' },
    { id: 2, name: 'Transport', color: '#60A5FA', type: 'expense' },
    { id: 3, name: 'Bills', color: '#FBBF24', type: 'expense' },
    { id: 4, name: 'Work', color: '#34D399', type: 'income' },
    { id: 5, name: 'Freelance', color: '#818CF8', type: 'income' },
    { id: 6, name: 'Shopping', color: '#F472B6', type: 'expense' },
    { id: 7, name: 'Health', color: '#2DD4BF', type: 'expense' },
    { id: 8, name: 'Others', color: '#9CA3AF', type: 'expense' },
];

// Category color mapping (for backwards compatibility)
export const CAT_COLORS = {
    Food: '#F87171',
    Transport: '#60A5FA',
    Bills: '#FBBF24',
    Work: '#34D399',
    Freelance: '#818CF8',
    Shopping: '#F472B6',
    Health: '#2DD4BF',
    Others: '#9CA3AF'
};
