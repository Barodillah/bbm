import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CreditCard, Smartphone, Wallet, Banknote, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

export default function AddWalletModal({ isOpen, onClose }) {
    const { addWallet } = useApp();
    const [type, setType] = useState('bank');
    const [name, setName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [balance, setBalance] = useState('');
    const [selectedColor, setSelectedColor] = useState('#4F46E5');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const walletTypes = [
        { id: 'bank', label: 'Bank', icon: <CreditCard size={18} /> },
        { id: 'credit', label: 'Credit', icon: <Wallet size={18} /> },
        { id: 'ewallet', label: 'e-Wallet', icon: <Smartphone size={18} /> },
        { id: 'paylater', label: 'Paylater', icon: <Clock size={18} /> },
    ];

    const colorOptions = [
        { name: 'Indigo', value: '#4F46E5' },
        { name: 'Purple', value: '#7C3AED' },
        { name: 'Emerald', value: '#059669' },
        { name: 'Rose', value: '#E11D48' },
        { name: 'Orange', value: '#EA580C' },
        { name: 'Dark', value: '#1F2937' },
        { name: 'Sky', value: '#0284C7' },
    ];

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Mohon isi nama wallet');
            return;
        }

        setIsLoading(true);
        try {
            const walletData = {
                name: name.trim(),
                type,
                account_number: accountNumber.trim() || null,
                initial_balance: parseFloat(balance) || 0,
                color: selectedColor,
                icon: type // Using type as icon identifier
            };

            await addWallet(walletData);
            toast.success('Wallet berhasil ditambahkan');

            // Reset form
            setName('');
            setAccountNumber('');
            setBalance('');
            setType('bank');
            setSelectedColor('#4F46E5');

            onClose();
        } catch (err) {
            console.error('Failed to add wallet:', err);
            toast.error('Gagal menambahkan wallet. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[24px] overflow-hidden flex flex-col max-h-[95vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Tambah Wallet</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Type Selector */}
                    <div className="grid grid-cols-4 gap-2 bg-gray-50 p-1.5 rounded-xl">
                        {walletTypes.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setType(item.id)}
                                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-bold transition-all ${type === item.id
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">
                                Nama {type === 'bank' ? 'Bank' : type === 'ewallet' ? 'E-Wallet' : type === 'cash' ? 'Kas' : 'Kartu'}
                            </label>
                            <input
                                type="text"
                                placeholder={type === 'bank' ? 'Contoh: BCA, Mandiri' : type === 'ewallet' ? 'Contoh: GoPay, OVO' : 'Contoh: Petty Cash'}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {type !== 'cash' && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">
                                    {type === 'ewallet' ? 'Nomor HP' : 'Nomor Rekening'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={type === 'ewallet' ? '08xxxxxxxxxx' : 'Nomor rekening'}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-medium text-gray-800 placeholder:text-gray-400"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Saldo Awal</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Warna Kartu</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-12 h-12 rounded-full relative shrink-0 transition-transform active:scale-95 ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {selectedColor === color.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Preview</label>
                        <div className="w-full h-24 rounded-2xl p-4 text-white relative overflow-hidden" style={{ backgroundColor: selectedColor }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs opacity-80">{name || 'Nama Wallet'}</p>
                                    <p className="text-lg font-bold mt-1">
                                        Rp {new Intl.NumberFormat('id-ID').format(parseFloat(balance) || 0)}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold uppercase opacity-70">{type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Wallet'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
