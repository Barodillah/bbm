import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Wallet, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import DateInput from './DateInput';

export default function EditTransactionModal({ isOpen, onClose, transaction }) {
    const { categories, catColors, updateTransaction, wallets } = useApp();
    const [display, setDisplay] = useState('0');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [walletId, setWalletId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showWalletDropdown, setShowWalletDropdown] = useState(false);

    // Filter categories based on selected type
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => cat.type === type);
    }, [categories, type]);

    // Initialize form with transaction data when modal opens
    useEffect(() => {
        if (transaction && isOpen) {
            setDisplay(transaction.amount.toString());
            setTitle(transaction.title);
            setType(transaction.type);
            setCategory(transaction.category);
            setDate(transaction.date);
            setWalletId(transaction.wallet_id || '');
        }
    }, [transaction, isOpen]);

    // Reset category when type changes (only if current category doesn't match)
    useEffect(() => {
        const categoryExists = filteredCategories.some(cat => cat.name === category);
        if (!categoryExists && filteredCategories.length > 0) {
            setCategory(filteredCategories[0].name);
        }
    }, [type, filteredCategories, category]);

    if (!isOpen || !transaction) return null;

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
    const selectedWallet = wallets.find(w => w.id === walletId);

    const handleSave = async () => {
        if (currentTotal === 0 || !title || !category || isLoading) return;
        setIsLoading(true);
        try {
            await updateTransaction(transaction.id, {
                title,
                amount: currentTotal,
                category,
                type,
                date,
                wallet_id: walletId || null
            });
            toast.success('Transaksi berhasil diperbarui');
            onClose();
        } catch (err) {
            console.error('Failed to update transaction:', err);
            toast.error('Gagal mengupdate transaksi. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[24px] overflow-hidden flex flex-col max-h-[95vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Edit Transaksi</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
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
                            <button
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Pengeluaran
                            </button>
                            <button
                                onClick={() => setType('income')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Pemasukan
                            </button>
                        </div>

                        {/* Wallet Selector */}
                        {wallets.length > 0 && (
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">
                                    Wallet
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl flex items-center justify-between text-left focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                                            <Wallet size={16} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {selectedWallet?.name || 'Tanpa Wallet'}
                                            </p>
                                            {selectedWallet && (
                                                <p className="text-xs text-gray-500 capitalize">{selectedWallet.type}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {showWalletDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {/* Option for no wallet */}
                                        <button
                                            onClick={() => {
                                                setWalletId('');
                                                setShowWalletDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${!walletId ? 'bg-indigo-50' : ''}`}
                                        >
                                            <div className="p-1.5 bg-gray-100 rounded-lg">
                                                <Wallet size={16} className="text-gray-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-600">Tanpa Wallet</p>
                                                <p className="text-xs text-gray-400">Tidak terhubung ke wallet manapun</p>
                                            </div>
                                        </button>

                                        {wallets.map((wallet) => (
                                            <button
                                                key={wallet.id}
                                                onClick={() => {
                                                    setWalletId(wallet.id);
                                                    setShowWalletDropdown(false);
                                                }}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-t border-gray-50 ${walletId === wallet.id ? 'bg-indigo-50' : ''}`}
                                            >
                                                <div className="p-1.5 bg-indigo-100 rounded-lg">
                                                    <Wallet size={16} className="text-indigo-600" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-sm font-semibold text-gray-800">{wallet.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{wallet.type}</p>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">
                                                    {formatCurrency(wallet.balance)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Catatan transaksi..."
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <DateInput
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="Pilih tanggal"
                        />
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.name)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === cat.name ? 'text-white shadow-md' : 'text-gray-600 opacity-60'
                                            }`}
                                        style={{
                                            backgroundColor: category === cat.name
                                                ? (catColors[cat.name] || '#6366F1')
                                                : `${catColors[cat.name] || '#6366F1'}30`
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 py-2">
                                    Belum ada kategori untuk {type === 'expense' ? 'pengeluaran' : 'pemasukan'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, '+', 4, 5, 6, 'C', 7, 8, 9, 'DEL', '000', 0, '.', 'OK'].map((key) => (
                            <button
                                key={key}
                                onClick={() => key === 'OK' ? handleSave() : handleNumpad(key.toString())}
                                disabled={key === 'OK' && isLoading}
                                className={`h-14 rounded-2xl text-xl font-bold transition-all flex items-center justify-center ${key === 'OK'
                                    ? `bg-indigo-600 text-white shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`
                                    : key === '+' || key === 'C' || key === 'DEL'
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {key === 'OK' && isLoading ? <Loader2 className="animate-spin" size={24} /> : key}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
