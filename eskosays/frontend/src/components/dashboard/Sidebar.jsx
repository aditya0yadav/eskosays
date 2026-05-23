import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Compass,
    Wallet,
    User,
    Settings,
    LogOut,
    Search,
    ChevronRight
} from 'lucide-react';
import { getAssetUrl } from '../../services/api';
import logo from '../../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, user, logout }) => {
    return (
        <aside className="hidden lg:flex w-20 xl:w-[280px] flex-col bg-[#0F1E3A] border-r border-white/5 z-30 transition-all duration-500 overflow-hidden relative">
            {/* Glassmorphism Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-20%] w-[120%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Logo Section */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
                        <div className="transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] flex items-center">
                        <img src={logo} alt="Eskosays" className="h-14 w-auto" />
                        <span className="hidden xl:inline-block ml-3 text-black font-bold text-lg">Eskosays</span>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 flex flex-col gap-2 p-4 relative z-10">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] xl:block lg:hidden">Main Menu</p>
                </div>
                <SidebarLink icon={<Home />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} color="indigo" />
                <SidebarLink icon={<Compass />} label="Discover" active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} color="blue" />
                <SidebarLink icon={<Wallet />} label="Wallet" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} color="cyan" />
                <SidebarLink icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} color="indigo" />
            </nav>

            {/* Bottom Section / User Profile */}
            <div className="p-4 mt-auto relative z-10">
                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-2 backdrop-blur-md">
                    <div className="group px-3 py-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all flex items-center justify-between">
                        <div
                            onClick={() => setActiveTab('profile')}
                            className="flex items-center gap-3 flex-1 truncate"
                        >
                            <div className="w-10 h-10 min-w-[40px] rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-blue-400 border border-white/10 shadow-lg flex items-center justify-center text-xs text-white font-black uppercase overflow-hidden transition-transform group-hover:scale-110 duration-500">
                                {user?.avatar_url ? (
                                    <img
                                        src={getAssetUrl(user.avatar_url)}
                                        alt={user?.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="flex flex-col xl:block lg:hidden truncate">
                                <p className="text-sm font-bold text-white leading-tight truncate">{user?.name || 'Explorer'}</p>
                                <p className="text-[10px] text-white/30 font-bold truncate uppercase tracking-widest mt-0.5">Premium Plan</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="block p-2.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const SidebarLink = ({ icon, label, active, onClick, color }) => {
    const activeColorMap = {
        indigo: 'from-indigo-600 to-indigo-400 shadow-indigo-500/20',
        blue: 'from-blue-600 to-blue-400 shadow-blue-500/20',
        cyan: 'from-cyan-500 to-blue-400 shadow-cyan-500/20'
    };

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-500 relative group overflow-hidden ${active ? '' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            {active && (
                <motion.div
                    layoutId="navGlow_premium"
                    className={`absolute inset-0 bg-gradient-to-r ${activeColorMap[color]} shadow-lg`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}

            <div className={`relative z-10 transition-transform duration-500 ${active ? 'scale-110 text-white' : 'group-hover:scale-110'}`}>
                {React.cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}
            </div>

            <span className={`relative z-10 text-sm font-bold tracking-tight xl:block lg:hidden transition-all duration-500 ${active ? 'text-white' : 'opacity-60 group-hover:opacity-100'}`}>
                {label}
            </span>

            {active && (
                <motion.div
                    layoutId="activeCaret"
                    className="ml-auto relative z-10 xl:block lg:hidden text-white"
                >
                    <ChevronRight size={14} strokeWidth={3} />
                </motion.div>
            )}
        </div>
    );
};

export default Sidebar;
