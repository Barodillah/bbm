import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import EditTransactionModal from '../components/EditTransactionModal';

export default function HistoryPage() {
    const { transactions, deleteTransaction } = useApp();
    const [editingTransaction, setEditingTransaction] = useState(null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <BalanceCard />

            <div className="flex items-center justify-between sticky top-16 md:top-24 bg-[#F9FAFB]/90 backdrop-blur-sm z-20 py-2">
                <h4 className="font-bold text-lg text-gray-800">Riwayat</h4>
                <button className="p-2 bg-white rounded-lg border border-gray-100">
                    <Filter size={18} className="text-gray-500" />
                </button>
            </div>

            <div className="space-y-3">
                {transactions.map((tx) => (
                    <TransactionItem
                        key={tx.id}
                        tx={tx}
                        onDelete={() => deleteTransaction(tx.id)}
                        onEdit={(tx) => setEditingTransaction(tx)}
                    />
                ))}
            </div>

            <EditTransactionModal
                isOpen={!!editingTransaction}
                onClose={() => setEditingTransaction(null)}
                transaction={editingTransaction}
            />
        </div>
    );
}
