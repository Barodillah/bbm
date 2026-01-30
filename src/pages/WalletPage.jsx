import React, { useState, useMemo } from 'react';
import { CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Eye, EyeOff, Trash2, Loader2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

import TransactionList from '../components/TransactionList';
import AddWalletModal from '../components/AddWalletModal';
import WalletTransactionModal from '../components/WalletTransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function WalletPage() {
    const { stats, wallets, transactions, deleteWallet, isLoading } = useApp();
    const [visibleCardIds, setVisibleCardIds] = useState(new Set());
    const [showAllWallets, setShowAllWallets] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Modal States
    const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
    const [transactionModal, setTransactionModal] = useState({
        isOpen: false,
        type: 'topup' // 'topup' or 'transfer'
    });
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, wallet: null });

    const toggleVisibility = (id) => {
        setVisibleCardIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const formatAccountNumber = (number, isVisible) => {
        if (!number) return '•••• •••• ••••';
        if (isVisible) return number;
        // Show first 4 and last 4, mask middle
        if (number.length > 8) {
            return `${number.slice(0, 4)} •••• ${number.slice(-4)}`;
        }
        return number;
    };

    // Separate wallets by type
    const bankWallets = useMemo(() => wallets.filter(w => w.type === 'bank' || w.type === 'credit'), [wallets]);
    const eWallets = useMemo(() => wallets.filter(w => w.type === 'ewallet'), [wallets]);
    const paylaterWallets = useMemo(() => wallets.filter(w => w.type === 'paylater'), [wallets]);
    const cashWallets = useMemo(() => wallets.filter(w => w.type === 'cash'), [wallets]);

    // Calculate total balance from wallets
    const totalWalletBalance = useMemo(() => {
        return wallets.reduce((acc, w) => acc + w.balance, 0);
    }, [wallets]);

    // Wallet transactions (filtering only transfer transactions)
    const walletTransactions = useMemo(() => {
        return transactions
            .filter(t => t.category === 'Transfer')
            .map(t => {
                // Find the wallet for this transaction
                const wallet = wallets.find(w => w.id === t.wallet_id);
                const walletName = wallet?.name || 'Unknown Wallet';

                // Add wallet info to transaction display
                return {
                    ...t,
                    walletInfo: walletName,
                    displayTitle: t.type === 'expense'
                        ? `${t.title} (dari ${walletName})`
                        : `${t.title} (ke ${walletName})`
                };
            })
            .slice(0, 10); // Latest 10 transactions
    }, [transactions, wallets]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };



    const handleDeleteWallet = async () => {
        if (!confirmDelete.wallet) return;

        setDeletingId(confirmDelete.wallet.id);
        try {
            await deleteWallet(confirmDelete.wallet.id);
            toast.success(`Wallet "${confirmDelete.wallet.name}" berhasil dihapus`);
        } catch (err) {
            toast.error('Gagal menghapus wallet');
        } finally {
            setDeletingId(null);
            setConfirmDelete({ isOpen: false, wallet: null });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-gray-500">Loading wallets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-4 space-y-6">
            <header className="px-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Wallets</h1>
                    <p className="text-sm text-gray-500">Manage your cards & cash</p>
                </div>
                <button
                    onClick={() => setIsAddWalletOpen(true)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </header>

            {/* Total Balance Overview */}
            <section className="px-4">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
                    <p className="text-sm opacity-80 mb-1">Total Saldo Semua Wallet</p>
                    <p className="text-3xl font-bold">{formatCurrency(totalWalletBalance || stats.totalBalance)}</p>
                    <div className="mt-3 flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>{wallets.length} Wallet Aktif</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bank Cards Section - Horizontal Scroll */}
            {bankWallets.length > 0 && (
                <section className="space-y-3">
                    <div className="px-4 flex justify-between items-end">
                        <h2 className="font-semibold text-gray-800">Bank Accounts</h2>
                        {bankWallets.length > 1 && (
                            <button
                                onClick={() => setShowAllWallets(!showAllWallets)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 active:scale-95 transition-all"
                            >
                                {showAllWallets ? 'Show less' : 'See all'}
                            </button>
                        )}
                    </div>

                    <div className={`${showAllWallets
                        ? 'flex flex-col gap-4 px-4'
                        : 'flex gap-4 overflow-x-auto px-4 pb-4 snap-x hide-scrollbar'
                        }`}>
                        {bankWallets.map((card) => (
                            <div
                                key={card.id}
                                className={`snap-center shrink-0 ${showAllWallets ? 'w-full' : 'w-[300px]'} h-[190px] rounded-3xl p-6 relative overflow-hidden shadow-xl text-white flex flex-col justify-between transition-all hover:scale-[1.02]`}
                                style={{ backgroundColor: card.color || '#4F46E5' }}
                            >
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>

                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <p className="text-xs font-medium opacity-80 mb-1">Total Balance</p>
                                        <p className="text-2xl font-bold tracking-tight">{formatCurrency(card.balance)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold tracking-wider italic opacity-90">{card.name}</span>
                                        <button
                                            onClick={() => setConfirmDelete({ isOpen: true, wallet: card })}
                                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} className="opacity-70 hover:opacity-100" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 z-10">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <div className="w-6 h-4 border border-white/30 rounded-sm flex gap-[2px] justify-center items-center">
                                                <div className="w-[1px] h-full bg-white/30"></div>
                                                <div className="w-[1px] h-full bg-white/30"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="tracking-widest font-mono text-sm opacity-90 transition-all duration-300 min-w-[140px] whitespace-nowrap">
                                                {formatAccountNumber(card.account_number, visibleCardIds.has(card.id))}
                                            </span>
                                            <button
                                                onClick={() => toggleVisibility(card.id)}
                                                className="opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-full"
                                            >
                                                {visibleCardIds.has(card.id) ? (
                                                    <EyeOff size={14} />
                                                ) : (
                                                    <Eye size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] opacity-60 uppercase mb-0.5">Type</span>
                                            <span className="text-sm font-medium tracking-wide capitalize">{card.type}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] opacity-60 uppercase mb-0.5">Status</span>
                                            <span className="text-sm font-medium tracking-wide">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card Placeholder */}
                        <div className={`snap-center shrink-0 ${showAllWallets ? 'w-full h-16' : 'w-[60px] h-[190px]'} flex items-center justify-center`}>
                            <button
                                onClick={() => setIsAddWalletOpen(true)}
                                className={`${showAllWallets ? 'w-full h-full rounded-2xl gap-2 font-medium bg-gray-50 border border-dashed border-gray-300' : 'w-12 h-12 rounded-full bg-gray-100'} flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors`}
                            >
                                <Plus size={showAllWallets ? 20 : 24} />
                                {showAllWallets && <span>Add New Card</span>}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* E-Wallet Section */}
            {eWallets.length > 0 && (
                <section className="px-4 space-y-3">
                    <h2 className="font-semibold text-gray-800">E-Wallets</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {eWallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${wallet.color}20` }}>
                                        <CreditCard size={20} style={{ color: wallet.color }} />
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ isOpen: true, wallet })}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} className="text-gray-400" />
                                    </button>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{wallet.name}</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(wallet.balance)}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Paylater Section */}
            {paylaterWallets.length > 0 && (
                <section className="px-4 space-y-3">
                    <h2 className="font-semibold text-gray-800">Paylater</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {paylaterWallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${wallet.color || '#EA580C'}20` }}>
                                        <Clock size={20} style={{ color: wallet.color || '#EA580C' }} />
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({ isOpen: true, wallet })}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} className="text-gray-400" />
                                    </button>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{wallet.name}</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(wallet.balance)}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <section className="px-4">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-semibold text-gray-800">Cash Wallet</h2>
                </div>

                {cashWallets.length > 0 ? (
                    cashWallets.map((wallet) => (
                        <div key={wallet.id} className="w-full h-[180px] bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-200 flex flex-col justify-between group cursor-pointer transition-all hover:scale-[1.02] mb-4">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-20">
                                <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id={`pattern_cash_${wallet.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#pattern_cash_${wallet.id})`} />
                                </svg>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute top-10 -left-10 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl"></div>

                            <div className="flex justify-between items-start z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-emerald-100 shadow-sm">
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-lg tracking-wide text-white">{wallet.name}</span>
                                        <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-medium">Liquid Assets</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, wallet })}
                                    className="text-emerald-200 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                                >
                                    <MoreHorizontal size={24} />
                                </button>
                            </div>

                            <div className="z-10 mt-auto mb-2">
                                <span className="text-xs font-medium text-emerald-200/80 mb-1 block">Total Available</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-medium text-emerald-200 mb-1">Rp</span>
                                    <span className="text-3xl font-bold tracking-tight text-white">
                                        {new Intl.NumberFormat('id-ID').format(wallet.balance)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 z-10 border-t border-white/10 pt-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-100/90 bg-black/10 px-2 py-1 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span>Active Status</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-100/90">
                                    <span>IDR Currency</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full h-[180px] bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-200 flex flex-col justify-between">
                        {/* Default Cash Wallet using stats.totalBalance */}
                        <div className="absolute inset-0 opacity-20">
                            <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="pattern_cash" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#pattern_cash)" />
                            </svg>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-start z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-emerald-100">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <span className="block font-semibold text-lg text-white">Petty Cash</span>
                                    <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Liquid Assets</span>
                                </div>
                            </div>
                        </div>

                        <div className="z-10 mt-auto mb-2">
                            <span className="text-xs font-medium text-emerald-200/80 mb-1 block">Total Available</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-medium text-emerald-200">Rp</span>
                                <span className="text-3xl font-bold text-white">
                                    {new Intl.NumberFormat('id-ID').format(stats.totalBalance)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 z-10 border-t border-white/10 pt-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-100/90 bg-black/10 px-2 py-1 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span>Based on Transactions</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="px-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTransactionModal({ isOpen: true, type: 'topup' })}
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-medium text-gray-700 active:scale-95 transition-transform"
                    >
                        <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                            <ArrowDownLeft size={16} />
                        </div>
                        Top Up
                    </button>
                    <button
                        onClick={() => setTransactionModal({ isOpen: true, type: 'transfer' })}
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-medium text-gray-700 active:scale-95 transition-transform"
                    >
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                            <ArrowUpRight size={16} />
                        </div>
                        Transfer
                    </button>
                </div>
            </section>

            {/* Empty State for No Wallets */}
            {wallets.length === 0 && (
                <section className="px-4">
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet size={28} className="text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Wallet</h3>
                        <p className="text-sm text-gray-500 mb-4">Tambahkan wallet pertama Anda untuk mulai mengelola keuangan</p>
                        <button
                            onClick={() => setIsAddWalletOpen(true)}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Tambah Wallet
                        </button>
                    </div>
                </section>
            )}

            {/* Wallet History */}
            {walletTransactions.length > 0 && (
                <section className="px-4 pb-4">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <TransactionList
                        transactions={walletTransactions}
                        onDelete={() => { }}
                        onEdit={() => { }}
                        showDailySummary={false}
                        customIconClass="text-blue-600"
                        customIconBgClass="bg-blue-50"
                    />
                </section>
            )}

            {/* Modals */}
            <AddWalletModal
                isOpen={isAddWalletOpen}
                onClose={() => setIsAddWalletOpen(false)}
            />

            <WalletTransactionModal
                isOpen={transactionModal.isOpen}
                onClose={() => setTransactionModal(prev => ({ ...prev, isOpen: false }))}
                initialType={transactionModal.type}
            />

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                title="Hapus Wallet?"
                message={`Apakah Anda yakin ingin menghapus wallet "${confirmDelete.wallet?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText={deletingId ? "Menghapus..." : "Hapus"}
                onConfirm={handleDeleteWallet}
                onCancel={() => setConfirmDelete({ isOpen: false, wallet: null })}
                variant="danger"
            />
        </div>
    );
}
