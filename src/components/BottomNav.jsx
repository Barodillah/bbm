import { NavLink, useLocation } from 'react-router-dom';
import { Receipt, Wallet, PieChart as PieIcon, Settings, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav({ onAddClick }) {
    const location = useLocation();
    const getNavClass = (isActive) =>
        `flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`;

    const isHomeActive = location.pathname === '/' || location.pathname === '/history';

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 px-4 z-40">
            <NavLink to="/" className={() => getNavClass(isHomeActive)}>
                <Receipt size={20} />
                <span className="text-[10px] font-medium">Transaksi</span>
            </NavLink>
            <NavLink to="/wallet" className={({ isActive }) => getNavClass(isActive)}>
                <Wallet size={20} />
                <span className="text-[10px] font-medium">Wallet</span>
            </NavLink>

            {/* Add Button - Center */}
            <button
                onClick={onAddClick}
                className="flex flex-col items-center gap-1 flex-1"
            >
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 -mt-4">
                    <Plus size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-medium text-indigo-600">Tambah</span>
            </button>

            <NavLink to="/analysis" className={({ isActive }) => getNavClass(isActive)}>
                <PieIcon size={20} />
                <span className="text-[10px] font-medium">Analysis</span>
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => getNavClass(isActive)}>
                <Settings size={20} />
                <span className="text-[10px] font-medium">Setting</span>
            </NavLink>
        </nav>
    );
}
