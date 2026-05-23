import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/admin-api';
import {
    Search, Users, DollarSign, Activity, Trophy, TrendingUp, Calendar, Filter, Loader2, Crown, ChevronRight, UserPlus, MoreHorizontal
} from 'lucide-react';

const AdminUsers = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'leaderboard'
    const [users, setUsers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        country: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchData();
    }, [searchQuery, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, leaderboardRes] = await Promise.all([
                adminService.getUsers({ search: searchQuery, ...filters }),
                adminService.getLeaderboard()
            ]);
            if (usersRes.success) {
                setUsers(usersRes.data.users || []);
            }
            if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || []);
        } catch (error) {
            console.error('Failed to fetch user data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewProfile = (userId) => {
        window.open(`/admin/users/${userId}`, '_blank');
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Elegant Header & Tabs */}
                {/* ... (Header logic stays same) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Member Directory</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage platform panelists and track top-tier performance.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users'
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Directory List
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'leaderboard'
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            Top Earners
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'users' ? (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Advanced Filter Suite */}
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                                <div className="xl:col-span-2 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <select
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">Status: All</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                    <select
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
                                        value={filters.country}
                                        onChange={(e) => handleFilterChange('country', e.target.value)}
                                    >
                                        <option value="">Global Coverage</option>
                                        <option value="US">USA</option>
                                        <option value="IN">India</option>
                                        <option value="GB">UK</option>
                                        <option value="CA">Canada</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Professional Data Grid */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="py-5 px-8 text-[11px] font-bold uppercase tracking-wider text-slate-400">Panelist</th>
                                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Status</th>
                                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Registration Date</th>
                                            <th className="py-5 px-8 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Lifetime Yield</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(users || []).map((user) => {
                                            const safeDate = user.created_at ? new Date(user.created_at) : null;
                                            return (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => handleViewProfile(user.id)}
                                                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="py-5 px-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-11 h-11 rounded-full bg-slate-100 p-[1px] shadow-sm">
                                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff&bold=true`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name || 'Anonymous Member'}</span>
                                                                <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <div className={`
                                                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                            ${user.status?.toLowerCase() === 'active'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-slate-100 text-slate-500'}
                                                        `}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status?.toLowerCase() === 'active' ? 'bg-emerald-500 shadow-sm' : 'bg-slate-300'}`} />
                                                            {user.status || 'Active'}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <span className="text-xs font-semibold text-slate-400">
                                                            {safeDate && !isNaN(safeDate)
                                                                ? safeDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-8 text-right">
                                                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                            ${parseFloat(user.lifetime_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {users.length === 0 && (
                                    <div className="py-24 text-center text-slate-300 text-sm font-semibold uppercase tracking-widest bg-slate-50/20">
                                        No records found in the directory
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="py-5 px-8 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-20 text-center">Rank</th>
                                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Panelist</th>
                                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Total Completions</th>
                                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Quality Score</th>
                                            <th className="py-5 px-8 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leaderboard.map((user, idx) => {
                                            const isTop3 = idx < 3;
                                            const rankColors = [
                                                'bg-amber-50 text-amber-600 border-amber-100', // Gold
                                                'bg-slate-100 text-slate-600 border-slate-200', // Silver
                                                'bg-orange-50 text-orange-600 border-orange-100' // Bronze
                                            ];

                                            return (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => handleViewProfile(user.id)}
                                                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="py-5 px-8 text-center">
                                                        <div className={`
                                                            inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black
                                                            ${isTop3 ? rankColors[idx] + ' border' : 'text-slate-400'}
                                                        `}>
                                                            {idx + 1}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 p-[1px] shadow-sm relative">
                                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.first_name || 'U')}&background=random&color=fff&bold=true`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                                {idx === 0 && (
                                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                        <Crown className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name || user.first_name || 'Anonymous Member'}</span>
                                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user.country || 'Global'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        <span className="text-sm font-bold text-slate-600 tabular-nums">
                                                            {user.surveys || user.total_surveys || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                                                            <Activity className="w-3 h-3" />
                                                            {user.quality_score || '98'}%
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-8 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                                ${parseFloat(user.earnings || user.lifetime_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                                                                +{((user.earnings / 1200) * 10).toFixed(1)}% Velocity
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUsers;
