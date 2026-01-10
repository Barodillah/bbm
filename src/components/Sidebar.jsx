import { NavLink } from 'react-router-dom';
import { Home, History, PieChart as PieIcon, Settings } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/history', label: 'History', icon: History },
    { to: '/analysis', label: 'Analysis', icon: PieIcon },
    { to: '/categories', label: 'Categories', icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-indigo-600">JJ's Moneys</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-6 border-t border-gray-50 text-xs text-gray-400">v2.0.0 • React Edition</div>
        </aside>
    );
}
