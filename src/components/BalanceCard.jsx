import { useState, useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import StatBox from './StatBox';
import AIChatModal from './AIChatModal';

export default function BalanceCard({ monthOnly = false }) {
    const { stats: globalStats, transactions, isScrolled } = useApp();
    const [isAIOpen, setIsAIOpen] = useState(false);

    const displayStats = useMemo(() => {
        if (!monthOnly) return globalStats;

        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

        return transactions
            .filter(t => {
                const d = new Date(t.date);
                return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey && t.category !== 'Transfer';
            })
            .reduce((acc, t) => {
                if (t.type === 'income') {
                    acc.totalIncome += t.amount;
                    acc.totalBalance += t.amount;
                } else {
                    acc.totalExpense += t.amount;
                    acc.totalBalance -= t.amount;
                }
                return acc;
            }, { totalBalance: 0, totalIncome: 0, totalExpense: 0 });
    }, [globalStats, transactions, monthOnly]);

    return (
        <>
            <div className={`transition-all duration-300 transform ${isScrolled ? 'scale-95 opacity-80' : 'scale-100'}`}>
                <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                        <Wallet size={200} />
                    </div>

                    {/* AI Button - Top Right */}
                    <button
                        onClick={() => setIsAIOpen(true)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-10"
                        title="AI Assistant"
                    >
                        <Sparkles size={18} className="text-white group-hover:animate-pulse" />
                    </button>

                    <p className="text-indigo-100 text-sm font-medium mb-1 opacity-80">
                        {monthOnly ? 'Cashflow Bulan Ini' : 'Total Saldo Kamu'}
                    </p>
                    <h3 className="text-4xl font-black mb-6 tracking-tight">{formatCurrency(displayStats.totalBalance)}</h3>
                    <div className="flex gap-4">
                        <StatBox label="Income" amount={displayStats.totalIncome} color="emerald" icon={ArrowUpRight} formatCurrency={formatCurrency} />
                        <StatBox label="Expense" amount={displayStats.totalExpense} color="rose" icon={ArrowDownLeft} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </div>

            <AIChatModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
        </>
    );
}
