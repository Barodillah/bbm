import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function StatBox({ label, amount, color, icon: Icon, formatCurrency }) {
    const colors = {
        emerald: 'bg-emerald-400/20 text-emerald-400',
        rose: 'bg-rose-400/20 text-rose-400'
    };

    return (
        <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colors[color]}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-indigo-100 leading-none mb-1">{label}</p>
                <p className="text-xs font-black">{formatCurrency(amount)}</p>
            </div>
        </div>
    );
}
