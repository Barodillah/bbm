import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export default function WalletTransactionModal({ isOpen, onClose, initialType = 'topup' }) {
    const { wallets, addTransaction, updateWallet } = useApp();
    const [type, setType] = useState(initialType);
    const [display, setDisplay] = useState('0');
    const [sourceWalletId, setSourceWalletId] = useState('');
    const [targetWalletId, setTargetWalletId] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setType(initialType);
            setDisplay('0');
            setNotes('');
            // Set default wallets
            if (wallets.length > 0) {
                setSourceWalletId(wallets[0].id);
                if (wallets.length > 1) {
                    setTargetWalletId(wallets[1].id);
                }
            }
        }
    }, [isOpen, initialType, wallets]);

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
    const sourceWallet = wallets.find(w => w.id === sourceWalletId);
    const targetWallet = wallets.find(w => w.id === targetWalletId);

    const handleSave = async () => {
        if (currentTotal === 0 || isLoading) {
            return;
        }

        if (type === 'transfer') {
            if (!sourceWalletId || !targetWalletId) {
                toast.error('Pilih wallet sumber dan tujuan');
                return;
            }
            if (sourceWalletId === targetWalletId) {
                toast.error('Wallet sumber dan tujuan tidak boleh sama');
                return;
            }
            // Allow credit and paylater wallets to transfer even with negative balance
            const allowNegativeBalance = sourceWallet?.type === 'credit' || sourceWallet?.type === 'paylater';
            if (sourceWallet && sourceWallet.balance < currentTotal && !allowNegativeBalance) {
                toast.error('Saldo tidak mencukupi');
                return;
            }
        }

        if (type === 'topup' && !targetWalletId) {
            toast.error('Pilih wallet tujuan');
            return;
        }

        setIsLoading(true);
        try {
            if (type === 'topup') {
                // Top up: add income to target wallet
                await addTransaction({
                    title: notes || `Top Up ${targetWallet?.name || 'Wallet'}`,
                    amount: currentTotal,
                    category: 'Top Up',
                    type: 'income',
                    date: new Date().toISOString().split('T')[0],
                    wallet_id: targetWalletId
                });
                toast.success('Top Up berhasil');
            } else {
                // Transfer: move money between wallets
                // Deduct from source
                await addTransaction({
                    title: notes || `Transfer ke ${targetWallet?.name || 'Wallet'}`,
                    amount: currentTotal,
                    category: 'Transfer',
                    type: 'expense',
                    date: new Date().toISOString().split('T')[0],
                    wallet_id: sourceWalletId
                });

                // Add to target
                await addTransaction({
                    title: notes || `Transfer dari ${sourceWallet?.name || 'Wallet'}`,
                    amount: currentTotal,
                    category: 'Transfer',
                    type: 'income',
                    date: new Date().toISOString().split('T')[0],
                    wallet_id: targetWalletId
                });

                toast.success('Transfer berhasil');
            }

            onClose();
        } catch (err) {
            console.error('Transaction failed:', err);
            toast.error('Transaksi gagal. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[24px] overflow-hidden flex flex-col max-h-[95vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">{type === 'topup' ? 'Top Up Wallet' : 'Transfer Dana'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Amount Display */}
                    <div className="text-right py-4 border-b-2 border-indigo-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nominal</p>
                        <div className="text-4xl font-black text-gray-900 break-all">
                            {formatCurrency(currentTotal)}
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setType('topup')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'topup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <ArrowDownLeft size={16} />
                            Top Up
                        </button>
                        <button
                            onClick={() => setType('transfer')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'transfer' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <ArrowRightLeft size={16} />
                            Transfer
                        </button>
                    </div>

                    {/* Wallet Selection */}
                    <div className="space-y-4">
                        {type === 'transfer' && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Dari Wallet</label>
                                <select
                                    value={sourceWalletId}
                                    onChange={(e) => setSourceWalletId(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-800"
                                >
                                    <option value="">Pilih Wallet</option>
                                    {wallets.map(wallet => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.name} - {formatCurrency(wallet.balance)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">
                                {type === 'topup' ? 'Ke Wallet' : 'Ke Wallet Tujuan'}
                            </label>
                            <select
                                value={targetWalletId}
                                onChange={(e) => setTargetWalletId(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-800"
                            >
                                <option value="">Pilih Wallet</option>
                                {wallets
                                    .filter(w => type === 'transfer' ? w.id !== sourceWalletId : true)
                                    .map(wallet => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.name} - {formatCurrency(wallet.balance)}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Catatan (opsional)</label>
                            <input
                                type="text"
                                placeholder="Keterangan transaksi..."
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-800 placeholder:text-gray-400"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Transfer Preview */}
                    {type === 'transfer' && sourceWallet && targetWallet && currentTotal > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">{sourceWallet.name}</p>
                                    <p className="text-sm font-bold text-rose-600">-{formatCurrency(currentTotal)}</p>
                                </div>
                                <ArrowRightLeft size={20} className="text-gray-400" />
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">{targetWallet.name}</p>
                                    <p className="text-sm font-bold text-emerald-600">+{formatCurrency(currentTotal)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Numpad */}
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, '+', 4, 5, 6, 'C', 7, 8, 9, 'DEL', '000', 0, '', 'OK'].map((key, i) => (
                            key === '' ? <div key={i}></div> :
                                <button
                                    key={key}
                                    onClick={() => key === 'OK' ? handleSave() : handleNumpad(key.toString())}
                                    disabled={key === 'OK' && isLoading}
                                    className={`h-14 rounded-2xl text-xl font-bold transition-all flex items-center justify-center ${key === 'OK'
                                        ? `bg-indigo-600 text-white shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`
                                        : key === '+' || key === 'C' || key === 'DEL'
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'bg-gray-100 text-gray-800 active:scale-95'
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
