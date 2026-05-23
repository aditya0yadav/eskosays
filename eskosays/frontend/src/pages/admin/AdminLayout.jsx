import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BarChart2, Users, LogOut, Menu, X, Search, ChevronRight, Activity, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/panels', icon: Activity, label: 'Panel Analytics' },
        { path: '/admin/blogs', icon: BookOpen, label: 'Blog Posts' },
        // { path: '/admin/analytics', icon: BarChart2, label: 'Growth Stats' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        const lowerQuery = query.toLowerCase();
        // 1. Check if it matches a page name
        const match = navItems.find(item => item.label.toLowerCase().includes(lowerQuery));
        if (match) {
            navigate(match.path);
        } else {
            // 2. If no page match, assume searching for a user/record and redirect to directory
            navigate(`/admin/users?search=${encodeURIComponent(query)}`);
        }
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100 relative">
            {/* Sidebar Overlay (Mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Floating Toggle (Mobile Only since Header is gone) */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-6 left-6 p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] lg:hidden text-slate-600 hover:text-indigo-600 transition-all"
            >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sleek Executive Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm"
            >
                {/* Logo Area */}
                <div className="h-28 flex items-center px-6 border-b border-slate-50 relative">
                    <div className="flex items-center cursor-pointer group w-full" onClick={() => navigate('/admin/dashboard')}>
                        <img
                            src={logo}
                            alt="Logo"
                            className={`transition-all duration-300 object-contain object-left ${isSidebarOpen ? 'h-16 w-full' : 'h-10 w-10 mx-auto'}`}
                        />
                    </div>
                </div>

                {/* Sidebar Search - "Search functionality completed" */}
                {isSidebarOpen && (
                    <div className="px-4 mt-6">
                        <form onSubmit={handleSearch} className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                            />
                        </form>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* Desktop Toggle Button inside sidebar for better UX without header */}
                    <div className="hidden lg:flex items-center justify-end px-3 mb-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                    </div>

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {isSidebarOpen && (
                                    <span className="text-[14px] whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer / Profile Information */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3 p-2 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden flex-shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=Admin&background=6366F1&color=fff&bold=true`} alt="Admin" className="w-full h-full object-cover" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col min-w-0">
                                <h4 className="font-semibold text-sm text-slate-900 truncate">Administrator</h4>
                                <span className="text-[11px] text-slate-500 font-medium">System Manager</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`
                            mt-4 flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                            text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-medium
                            ${!isSidebarOpen && 'justify-center'}
                        `}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Page Content */}
                <main className="flex-1 p-8 lg:p-14 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
