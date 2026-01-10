import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  History, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  ChevronRight, 
  Filter,
  Trash2,
  Edit2,
  Wallet,
  Calendar,
  PieChart as PieIcon,
  TrendingUp
} from 'lucide-react';

/**
 * JJ's Moneys - Financial Web App v1.1
 * Updates: Added Analysis Page with Pie Chart distribution.
 */

// --- MOCK DATA ---
const INITIAL_TRANSACTIONS = [
  { id: 1, title: 'Gaji Bulanan', amount: 15000000, type: 'income', category: 'Work', date: '2023-10-25' },
  { id: 2, title: 'Kopi Kenangan', amount: 45000, type: 'expense', category: 'Food', date: '2023-10-25' },
  { id: 3, title: 'Listrik & Air', amount: 850000, type: 'expense', category: 'Bills', date: '2023-10-24' },
  { id: 4, title: 'Bonus Project', amount: 2500000, type: 'income', category: 'Freelance', date: '2023-10-23' },
  { id: 5, title: 'Makan Malam', amount: 120000, type: 'expense', category: 'Food', date: '2023-10-23' },
  { id: 6, title: 'Bensin Motor', amount: 100000, type: 'expense', category: 'Transport', date: '2023-10-22' },
];

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Work', 'Freelance', 'Shopping', 'Health', 'Others'];
const CAT_COLORS = {
  Food: '#F87171',      // Rose
  Transport: '#60A5FA', // Blue
  Bills: '#FBBF24',     // Amber
  Work: '#34D399',      // Emerald
  Freelance: '#818CF8', // Indigo
  Shopping: '#F472B6',  // Pink
  Health: '#2DD4BF',    // Teal
  Others: '#9CA3AF'     // Gray
};

// --- FORMATTERS ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// --- COMPONENTS ---

const Sidebar = ({ activePage, setActivePage }) => (
  <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-600">JJ's Moneys</h1>
    </div>
    <nav className="flex-1 px-4 space-y-2">
      {[
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'history', label: 'History', icon: History },
        { id: 'analysis', label: 'Analysis', icon: PieIcon },
      ].map((item) => (
        <button 
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="p-6 border-t border-gray-50 text-xs text-gray-400">v1.1.0 • Analysis Update</div>
  </aside>
);

const BottomNav = ({ activePage, setActivePage }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 px-4 z-40">
    <button onClick={() => setActivePage('home')} className={`flex flex-col items-center gap-1 flex-1 ${activePage === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}>
      <Home size={20} />
      <span className="text-[10px] font-medium">Home</span>
    </button>
    <button onClick={() => setActivePage('history')} className={`flex flex-col items-center gap-1 flex-1 ${activePage === 'history' ? 'text-indigo-600' : 'text-gray-400'}`}>
      <History size={20} />
      <span className="text-[10px] font-medium">History</span>
    </button>
    <div className="w-12"></div> {/* FAB Spacer */}
    <button onClick={() => setActivePage('analysis')} className={`flex flex-col items-center gap-1 flex-1 ${activePage === 'analysis' ? 'text-indigo-600' : 'text-gray-400'}`}>
      <PieIcon size={20} />
      <span className="text-[10px] font-medium">Analysis</span>
    </button>
    <button className="flex flex-col items-center gap-1 flex-1 text-gray-400">
      <TrendingUp size={20} />
      <span className="text-[10px] font-medium">Budget</span>
    </button>
  </nav>
);

const TransactionModal = ({ isOpen, onClose, onSave }) => {
  const [display, setDisplay] = useState('0');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');

  if (!isOpen) return null;

  const handleNumpad = (val) => {
    if (val === 'DEL') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === 'C') {
      setDisplay('0');
    } else {
      setDisplay(prev => prev === '0' && val !== '+' ? val : prev + val);
    }
  };

  const calculateTotal = () => {
    try {
      const total = display.split('+').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
      return total;
    } catch { return 0; }
  };

  const currentTotal = calculateTotal();

  const handleSave = () => {
    if (currentTotal === 0 || !title) return;
    onSave({ title, amount: currentTotal, category, type, date: new Date().toISOString().split('T')[0] });
    setDisplay('0'); setTitle(''); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[24px] overflow-hidden flex flex-col max-h-[95vh] shadow-2xl">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Entry Keuangan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="text-right py-4 border-b-2 border-indigo-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nilai Input</p>
            <div className="text-4xl font-black text-gray-900 break-all">
              {display.includes('+') ? (
                <div className="flex flex-col items-end">
                  <span className="text-lg text-gray-300">{display}</span>
                  <span>{formatCurrency(currentTotal)}</span>
                </div>
              ) : formatCurrency(parseFloat(display) || 0)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}>Pengeluaran</button>
              <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>Pemasukan</button>
            </div>
            <input type="text" placeholder="Catatan transaksi..." className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, '+', 4, 5, 6, 'C', 7, 8, 9, 'DEL', '000', 0, '.', 'OK'].map((key) => (
              <button key={key} onClick={() => key === 'OK' ? handleSave() : handleNumpad(key.toString())} className={`h-14 rounded-2xl text-xl font-bold transition-all flex items-center justify-center ${key === 'OK' ? 'bg-indigo-600 text-white shadow-lg' : key === '+' || key === 'C' || key === 'DEL' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-800'}`}>{key}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ANALYSIS VIEW COMPONENTS ---
const AnalysisView = ({ transactions }) => {
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
        const percent = (amount / total) * 100;
        const start = lastPercentage;
        lastPercentage += percent;
        return { name, amount, percent, color: CAT_COLORS[name] || '#CBD5E1', start };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.amount, 0);

  // CSS Conic Gradient String
  const gradientString = expenseData
    .map(d => `${d.color} ${d.start}% ${(d.start + d.percent)}%`)
    .join(', ');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-lg text-gray-800">Distribusi Pengeluaran</h4>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Bulan Ini</button>
      </div>

      {/* Pie Chart Container */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col items-center">
        <div 
          className="relative w-56 h-56 rounded-full flex items-center justify-center shadow-inner"
          style={{ background: expenseData.length > 0 ? `conic-gradient(${gradientString})` : '#F3F4F6' }}
        >
          {/* Inner Circle for Doughnut Effect */}
          <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Out</p>
            <p className="text-xl font-black text-gray-800">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 w-full mt-10">
          {expenseData.map(item => (
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
      </div>

      {/* Summary Insights */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-100">Insight Keuangan</p>
          <p className="text-sm font-medium leading-relaxed">
            Pengeluaran terbesarmu ada pada kategori <span className="font-bold underline">"{expenseData[0]?.name}"</span>. Coba kurangi sedikit di bulan depan!
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isScrolled, setIsScrolled] = useState(false);

  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') { acc.totalIncome += t.amount; acc.totalBalance += t.amount; }
      else { acc.totalExpense += t.amount; acc.totalBalance -= t.amount; }
      return acc;
    }, { totalBalance: 0, totalIncome: 0, totalExpense: 0 });
  }, [transactions]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddTransaction = (newTx) => {
    setTransactions([{ ...newTx, id: Date.now() }, ...transactions]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col md:flex-row">
      
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 pb-24 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-[1200px] px-0 md:px-8">
          
          <header className={`sticky top-0 z-30 transition-all duration-300 w-full px-4 pt-4 pb-2 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent'}`}>
            <div className="flex items-center justify-between max-w-md mx-auto md:max-w-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">JJ</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none">Hello,</p>
                  <p className="text-sm font-black text-gray-800">Jonathan J.</p>
                </div>
              </div>
              <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100"><Search size={20} className="text-gray-400" /></button>
            </div>
          </header>

          <div className="max-w-md mx-auto md:max-w-none w-full space-y-6 px-4">
            
            {/* Balance Card - Hidden on Analysis for focus, or kept small */}
            {activePage !== 'analysis' && (
              <div className={`transition-all duration-300 transform ${isScrolled ? 'scale-95 opacity-80' : 'scale-100'}`}>
                <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-10 rotate-12"><Wallet size={200} /></div>
                  <p className="text-indigo-100 text-sm font-medium mb-1 opacity-80">Total Saldo Kamu</p>
                  <h3 className="text-4xl font-black mb-6 tracking-tight">{formatCurrency(stats.totalBalance)}</h3>
                  <div className="flex gap-4">
                    <StatBox label="Income" amount={stats.totalIncome} color="emerald" icon={ArrowUpRight} />
                    <StatBox label="Expense" amount={stats.totalExpense} color="rose" icon={ArrowDownLeft} />
                  </div>
                </div>
              </div>
            )}

            {activePage === 'home' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-gray-800">Transaksi Terbaru</h4>
                  <button onClick={() => setActivePage('history')} className="text-indigo-600 text-sm font-bold flex items-center gap-1">Lihat Semua <ChevronRight size={16} /></button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} onDelete={() => setTransactions(transactions.filter(t => t.id !== tx.id))} />
                  ))}
                </div>
              </div>
            )}

            {activePage === 'history' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between sticky top-16 md:top-24 bg-[#F9FAFB]/90 backdrop-blur-sm z-20 py-2">
                  <h4 className="font-bold text-lg text-gray-800">Riwayat</h4>
                  <button className="p-2 bg-white rounded-lg border border-gray-100"><Filter size={18} className="text-gray-500" /></button>
                </div>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} onDelete={() => setTransactions(transactions.filter(t => t.id !== tx.id))} />
                  ))}
                </div>
              </div>
            )}

            {activePage === 'analysis' && (
              <AnalysisView transactions={transactions} />
            )}

          </div>
        </div>
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 md:bottom-8 right-6 md:right-12 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-300 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all">
        <Plus size={32} />
      </button>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddTransaction} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatBox({ label, amount, color, icon: Icon }) {
  const colors = {
    emerald: 'bg-emerald-400/20 text-emerald-400',
    rose: 'bg-rose-400/20 text-rose-400'
  };
  return (
    <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-2">
      <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={18} /></div>
      <div>
        <p className="text-[10px] uppercase font-bold text-indigo-100 leading-none mb-1">{label}</p>
        <p className="text-xs font-black">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}

function TransactionItem({ tx, onDelete }) {
  const [isSwiped, setIsSwiped] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-50">
      <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6 text-white">
        <button onClick={onDelete} className="flex flex-col items-center gap-1"><Trash2 size={20} /><span className="text-[10px] font-bold">Hapus</span></button>
      </div>
      <div 
        onClick={() => setIsSwiped(!isSwiped)}
        className={`relative bg-white p-4 flex items-center gap-4 transition-transform duration-300 cursor-pointer ${isSwiped ? '-translate-x-20' : 'translate-x-0'}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {tx.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 leading-tight">{tx.title}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tx.category} • {tx.date}</p>
        </div>
        <div className="text-right">
          <p className={`font-black tracking-tighter ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-800'}`}>
            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount).replace('Rp', '').trim()}
          </p>
        </div>
      </div>
    </div>
  );
}
