import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { Wallet, Lock, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAssetUrl } from '../../services/api';

const NAV_LINKS = [
    { to: '/about-us', label: 'About Us' },
    { to: '/blog', label: 'Blog' },
    { to: '/faqs', label: 'FAQs' },
];

const Header = () => {
    const { user, isAuthenticated } = useAuth();
    const userBalance = user?.panelist?.balance || 0;
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const getAvatarUrl = () => {
        const path = user?.avatar_url || user?.panelist?.profile_picture;
        if (!path) return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=5B6CFF,0F1E3A&fontFamily=Arial&fontSize=40`;
        return getAssetUrl(path);
    };

    const avatarUrl = getAvatarUrl();

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="w-full bg-white border-b border-gray-200 shadow-sm relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex justify-between items-center">

                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-2 text-[#0F1E3A] no-underline hover:opacity-90" onClick={closeMenu}>
                        <div className="flex items-center">
                            <img src={logo} alt="Eskosays" className="h-20 md:h-24 lg:h-28 w-auto object-contain" />
                        </div>
                        <span className="hidden sm:inline-block text-gray-400 text-sm font-medium border-l border-gray-200 pl-2 ml-1">
                            Official Research Platform
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="text-sm font-medium text-gray-600 hover:text-[#5B6CFF] px-4 py-2 rounded-full hover:bg-[#5B6CFF]/5 transition-colors no-underline"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Auth Controls + Mobile Hamburger */}
                <div className="flex items-center gap-2 md:gap-6">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 md:gap-6">
                            <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-100 shadow-sm hover:bg-gray-100 transition-colors no-underline group">
                                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-[#5B6CFF] group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="hidden md:block text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">My Rewards</span>
                                    <span className="text-sm md:text-lg font-bold text-emerald-500">${Number(userBalance).toFixed(2)}</span>
                                </div>
                            </Link>
                            <Link to="/dashboard" className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer relative overflow-hidden ring-1 ring-slate-200 transition-all hover:ring-blue-500/30">
                                <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Mobile Login Button */}
                            <Link
                                to="/login"
                                className="md:hidden flex items-center gap-2 border-2 border-[#5B6CFF] rounded-full px-4 py-1.5 transition-all active:scale-95 no-underline"
                            >
                                <Lock className="h-4 w-4 text-[#5B6CFF]" />
                                <span className="text-sm font-bold text-[#5B6CFF]">Login</span>
                            </Link>

                            {/* Desktop Buttons */}
                            <Link
                                to="/login"
                                className="hidden md:block text-xs md:text-sm font-medium text-[#0F1E3A] hover:bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 md:px-5 md:py-2 transition-colors no-underline"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="hidden md:block text-xs md:text-sm font-bold text-white bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] hover:shadow-lg hover:shadow-blue-500/20 rounded-full px-4 py-1.5 md:px-6 md:py-2 shadow-sm transition-all no-underline"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        className="md:hidden p-2 rounded-xl text-gray-500 hover:text-[#5B6CFF] hover:bg-[#5B6CFF]/5 transition-all"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden absolute top-full right-4 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 px-2 flex flex-col gap-0.5 z-50 min-w-[140px]">
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={closeMenu}
                            className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors no-underline whitespace-nowrap ${location.pathname === to
                                ? 'bg-[#5B6CFF]/10 text-[#5B6CFF]'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#5B6CFF]'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;