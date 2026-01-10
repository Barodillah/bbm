import { useMemo, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

export default function AnalysisPage() {
    const { transactions, catColors } = useApp();
    const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'

    const expenseData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

        const groups = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        let lastPercentage = 0;
        return Object.entries(groups)
            .map(([name, amount]) => {
                const percent = total > 0 ? (amount / total) * 100 : 0;
                const start = lastPercentage;
                lastPercentage += percent;
                return { name, amount, percent, color: catColors[name] || '#CBD5E1', start };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, catColors]);

    const incomeData = useMemo(() => {
        const incomes = transactions.filter(t => t.type === 'income');
        const total = incomes.reduce((acc, curr) => acc + curr.amount, 0);

        const groups = incomes.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        let lastPercentage = 0;
        return Object.entries(groups)
            .map(([name, amount]) => {
                const percent = total > 0 ? (amount / total) * 100 : 0;
                const start = lastPercentage;
                lastPercentage += percent;
                return { name, amount, percent, color: catColors[name] || '#34D399', start };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, catColors]);

    const activeData = activeTab === 'expense' ? expenseData : incomeData;
    const totalAmount = activeData.reduce((acc, curr) => acc + curr.amount, 0);

    // CSS Conic Gradient String
    const gradientString = activeData
        .map(d => `${d.color} ${d.start}% ${(d.start + d.percent)}%`)
        .join(', ');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-gray-800">Analisis Keuangan</h4>
                <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Bulan Ini</button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
                        }`}
                >
                    <ArrowDownLeft size={18} />
                    Pengeluaran
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                        }`}
                >
                    <ArrowUpRight size={18} />
                    Pemasukan
                </button>
            </div>

            {/* Pie Chart Container */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col items-center">
                <div
                    className="relative w-56 h-56 rounded-full flex items-center justify-center shadow-inner"
                    style={{
                        background: activeData.length > 0
                            ? `conic-gradient(${gradientString})`
                            : '#F3F4F6'
                    }}
                >
                    {/* Inner Circle for Doughnut Effect */}
                    <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {activeTab === 'expense' ? 'Total Out' : 'Total In'}
                        </p>
                        <p className={`text-xl font-black ${activeTab === 'expense' ? 'text-gray-800' : 'text-emerald-600'}`}>
                            {formatCurrency(totalAmount)}
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    {activeData.map(item => (
                        <div key={item.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-800 leading-none mb-1">{item.name}</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-gray-400 font-medium">{formatCurrency(item.amount)}</p>
                                    <p className="text-[10px] font-black text-indigo-600">{item.percent.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {activeData.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-400 font-medium">Belum ada data {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}</p>
                    </div>
                )}
            </div>

            {/* Summary Insights */}
            {activeData[0] && (
                <div className={`${activeTab === 'expense' ? 'bg-indigo-600' : 'bg-emerald-600'} rounded-3xl p-6 text-white flex items-center gap-4`}>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${activeTab === 'expense' ? 'text-indigo-100' : 'text-emerald-100'}`}>
                            Insight Keuangan
                        </p>
                        <p className="text-sm font-medium leading-relaxed">
                            {activeTab === 'expense'
                                ? <>Pengeluaran terbesarmu ada pada kategori <span className="font-bold underline">"{activeData[0]?.name}"</span>. Coba kurangi sedikit di bulan depan!</>
                                : <>Sumber pemasukan terbesarmu ada pada kategori <span className="font-bold underline">"{activeData[0]?.name}"</span>. Pertahankan dan tingkatkan!</>
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
