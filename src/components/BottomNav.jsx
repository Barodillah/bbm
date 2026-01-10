import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, PieChart as PieIcon, Settings, Sparkles } from 'lucide-react';
import AIChatModal from './AIChatModal';

export default function BottomNav() {
    const [isAIOpen, setIsAIOpen] = useState(false);

    const getNavClass = (isActive) =>
        `flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`;

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 px-4 z-40">
                <NavLink to="/" className={({ isActive }) => getNavClass(isActive)}>
                    <Home size={20} />
                    <span className="text-[10px] font-medium">Home</span>
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => getNavClass(isActive)}>
                    <History size={20} />
                    <span className="text-[10px] font-medium">History</span>
                </NavLink>

                {/* AI Button - Center */}
                <button
                    onClick={() => setIsAIOpen(true)}
                    className="flex flex-col items-center gap-1 flex-1"
                >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 -mt-4">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-indigo-600">AI</span>
                </button>

                <NavLink to="/analysis" className={({ isActive }) => getNavClass(isActive)}>
                    <PieIcon size={20} />
                    <span className="text-[10px] font-medium">Analysis</span>
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => getNavClass(isActive)}>
                    <Settings size={20} />
                    <span className="text-[10px] font-medium">Categories</span>
                </NavLink>
            </nav>

            <AIChatModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
        </>
    );
}
