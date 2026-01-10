import { NavLink } from 'react-router-dom';
import { Home, History, PieChart as PieIcon, TrendingUp } from 'lucide-react';

export default function BottomNav() {
    const getNavClass = (isActive) =>
        `flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 px-4 z-40">
            <NavLink to="/" className={({ isActive }) => getNavClass(isActive)}>
                <Home size={20} />
                <span className="text-[10px] font-medium">Home</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => getNavClass(isActive)}>
                <History size={20} />
                <span className="text-[10px] font-medium">History</span>
            </NavLink>
            <div className="w-12"></div> {/* FAB Spacer */}
            <NavLink to="/analysis" className={({ isActive }) => getNavClass(isActive)}>
                <PieIcon size={20} />
                <span className="text-[10px] font-medium">Analysis</span>
            </NavLink>
            <button className="flex flex-col items-center gap-1 flex-1 text-gray-400">
                <TrendingUp size={20} />
                <span className="text-[10px] font-medium">Budget</span>
            </button>
        </nav>
    );
}
