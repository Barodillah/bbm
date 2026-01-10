import { useState, useEffect } from 'react';
import PinLogin from './components/PinLogin';

/**
 * Auth wrapper - shows PIN login if not authenticated
 */
export default function AuthWrapper({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check session storage for auth
        const auth = sessionStorage.getItem('jjm_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
        setIsChecking(false);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    // Show loading while checking auth
    if (isChecking) {
        return (
            <div className="fixed inset-0 bg-gradient-to-b from-indigo-600 to-purple-700 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    // Show PIN login if not authenticated
    if (!isAuthenticated) {
        return <PinLogin onSuccess={handleLoginSuccess} />;
    }

    // Show app if authenticated
    return children;
}
