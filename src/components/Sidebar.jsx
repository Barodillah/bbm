import { NavLink, useLocation } from 'react-router-dom';
import { Receipt, Wallet, PieChart as PieIcon, Settings, Sparkles } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Transaksi', icon: Receipt },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/analysis', label: 'Analysis', icon: PieIcon },
    { to: '/categories', label: 'Setting', icon: Settings },
];

export default function Sidebar({ onOpenAI }) {
    const location = useLocation();
    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-indigo-600">BBM</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => {
                            const active = item.to === '/' ? (isActive || location.pathname === '/history') : isActive;
                            return `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
                                }`;
                        }}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}

                <button
                    onClick={onOpenAI}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50 text-left"
                >
                    <Sparkles size={20} className="text-purple-600" />
                    <span className="font-medium text-purple-600">Tanya AI</span>
                </button>
            </nav>
            <div className="p-6 border-t border-gray-50 text-xs text-gray-400">v2.0.0 • React Edition</div>
        </aside>
    );
}
