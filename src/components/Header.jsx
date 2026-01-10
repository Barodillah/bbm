import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
    const { isScrolled } = useApp();

    return (
        <header className={`sticky top-0 z-30 transition-all duration-300 w-full px-4 pt-4 pb-2 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent'
            }`}>
            <div className="flex items-center justify-between max-w-md mx-auto md:max-w-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">JJ</div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none">Hello,</p>
                        <p className="text-sm font-black text-gray-800">Jeje</p>
                    </div>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                    <Search size={20} className="text-gray-400" />
                </button>
            </div>
        </header>
    );
}
