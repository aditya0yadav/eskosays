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
        if (!path) return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=0022FF,0F1E3A&fontFamily=Arial&fontSize=40`;
        return getAssetUrl(path);
    };

    const avatarUrl = getAvatarUrl();
    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* ── Navigation Bar ─────────────────────────────────────────── */}
            <header className="w-full bg-white border-b border-gray-100 shadow-sm relative z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">

                    {/* Left: Logo + separator + sub-brand */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3 no-underline hover:opacity-90" onClick={closeMenu}>
                            <img src={logo} alt="Eskosays" className="h-9 md:h-10 w-auto object-contain" />
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-px h-6 bg-gray-200" />
                                <span className="text-slate-400 text-xs font-medium tracking-wide">
                                    Official Research Platform
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`text-sm font-medium px-4 py-2 rounded-full transition-colors no-underline ${
                                    location.pathname === to
                                        ? 'text-[#0022FF] bg-[#0022FF]/8'
                                        : 'text-gray-600 hover:text-[#0022FF] hover:bg-[#0022FF]/5'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Auth Controls + Mobile Hamburger */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 md:gap-4">
                                <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-100 shadow-sm hover:bg-gray-100 transition-colors no-underline group">
                                    <Wallet className="h-4 w-4 md:h-5 md:w-5 text-[#0022FF] group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="hidden md:block text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">My Rewards</span>
                                        <span className="text-sm md:text-lg font-bold text-emerald-500">${Number(userBalance).toFixed(2)}</span>
                                    </div>
                                </Link>
                                <Link to="/dashboard" className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer relative overflow-hidden ring-2 ring-transparent hover:ring-[#0022FF]/30 transition-all">
                                    <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Mobile Login Button */}
                                <Link
                                    to="/login"
                                    className="md:hidden flex items-center gap-2 border-2 border-[#0022FF] rounded-full px-4 py-1.5 transition-all active:scale-95 no-underline"
                                >
                                    <Lock className="h-4 w-4 text-[#0022FF]" />
                                    <span className="text-sm font-bold text-[#0022FF]">Login</span>
                                </Link>

                                {/* Desktop Buttons */}
                                <Link
                                    to="/login"
                                    className="hidden md:block text-sm font-medium text-[#0F1E3A] hover:bg-gray-50 border border-gray-200 rounded-full px-5 py-2 transition-colors no-underline"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="hidden md:block text-sm font-bold text-white rounded-full px-6 py-2 shadow-sm transition-all no-underline hover:shadow-lg hover:shadow-blue-700/30 hover:-translate-y-px"
                                    style={{ background: 'linear-gradient(135deg, #0022FF 0%, #4FD1E8 100%)' }}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-[#0022FF] hover:bg-[#0022FF]/5 transition-all"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {menuOpen && (
                    <div className="md:hidden absolute top-full right-4 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 px-2 flex flex-col gap-0.5 z-50 min-w-[160px]">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors no-underline whitespace-nowrap ${
                                    location.pathname === to
                                        ? 'bg-[#0022FF]/10 text-[#0022FF]'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0022FF]'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* ── Trust Banner — Site-Wide, directly below nav ────────────── */}
            <div className="w-full h-10 flex items-center justify-center relative overflow-hidden" style={{ background: '#0022FF' }}>
                {/* Subtle animated shimmer on banner */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s ease-in-out infinite',
                    }}
                />
                <div className="flex items-center gap-3 z-10">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
                        ))}
                    </div>
                    <span className="text-white text-xs sm:text-sm font-semibold tracking-wide">
                        Trusted by leading organizations worldwide
                    </span>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;