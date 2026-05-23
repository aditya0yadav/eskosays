import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Compass,
    Wallet,
    User,
    Settings,
    LogOut
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

import Sidebar from '../../components/dashboard/Sidebar';
import HomeTab from '../../components/dashboard/tabs/HomeTab';
import DiscoverTab from '../../components/dashboard/tabs/DiscoverTab';
import WalletTab from '../../components/dashboard/tabs/WalletTab';
import ProfileTab from '../../components/dashboard/tabs/ProfileTab';
import ProfileCompletionModal from '../../components/profile/ProfileCompletionModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'discover';

    const [showProfileModal, setShowProfileModal] = useState(true);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Render helper
    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <HomeTab />;
            case 'discover': return <DiscoverTab />;
            case 'wallet': return <WalletTab />;
            case 'profile': return <ProfileTab />;
            default: return <HomeTab />;
        }
    };

    return (
        <div className="h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-display transition-colors duration-500">
            {showProfileModal && <ProfileCompletionModal onClose={() => setShowProfileModal(false)} />}

            {/* Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                logout={handleLogout}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="p-6 lg:p-10 pt-10 lg:pt-10 max-w-7xl mx-auto w-full pb-32 lg:pb-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25
                            }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>


                {/* Mobile Bottom Tab Bar */}
                <nav className="fixed bottom-6 left-6 right-6 h-20 bg-[#0F1E3A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex lg:hidden items-center justify-around px-6 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <MobileNavLink icon={<Home />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <MobileNavLink icon={<Compass />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
                    <MobileNavLink icon={<Wallet />} active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
                    <MobileNavLink icon={<User />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </nav>
            </main>
        </div>
    );
};

const MobileNavLink = ({ icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 py-1 flex flex-col items-center justify-center transition-all ${active ? 'text-indigo-400' : 'text-white/40'}`}
    >
        <div className="relative z-10">
            {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        </div>
        {active && (
            <motion.div
                layoutId="mobileActiveIndicator_premium"
                className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
            />
        )}
    </button>
);

export default Dashboard;
