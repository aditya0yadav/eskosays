import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Activity,
    Zap,
    TrendingUp,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import userService from '../../../services/user.service';

const HomeTab = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            console.log('HomeTab: No user found in useAuth, skipping fetch.');
            return;
        }

        const fetchStats = async () => {
            console.log('HomeTab: Fetching stats for user:', user);
            try {
                console.log('HomeTab: Calling userService.getHomeStats()...');
                const response = await userService.getHomeStats();
                console.log('HomeTab: API Response:', response);

                if (response.success) {
                    setStats(response.data);
                } else {
                    console.warn('HomeTab: API returned success:false', response);
                }
            } catch (error) {
                console.error('HomeTab: Failed to fetch home stats:', error);
                if (error.response) {
                    console.error('HomeTab: Error Status:', error.response.status);
                    console.error('HomeTab: Error Data:', error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const formatTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    const dashboardStats = stats ? [
        { label: 'Available Balance', value: `$${stats.balance.toFixed(2)}`, change: `Ready`, icon: <DollarSign className="w-5 h-5" />, theme: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' } },
        { label: 'Total Earnings', value: `$${stats.lifetime_earnings.toFixed(2)}`, change: `Lifetime`, icon: <TrendingUp className="w-5 h-5" />, theme: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' } },
        { label: 'Surveys Finished', value: stats.completions_count, change: 'Verified', icon: <Activity className="w-5 h-5" />, theme: { text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' } },
        { label: 'Trust Score', value: `${Math.round(stats.quality_score)}%`, change: `Level`, icon: <Zap className="w-5 h-5" />, theme: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' } },
    ] : [];

    const withdrawalThreshold = 25.00;
    const amountToWithdrawal = Math.max(0, withdrawalThreshold - (stats?.balance || 0));
    const progressPercent = Math.min(100, ((stats?.balance || 0) / withdrawalThreshold) * 100);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-4xl font-sans font-[300] tracking-tight text-slate-900">
                        Welcome back, <span className="text-blue-600 font-[400]">{user?.name || 'Explorer'}</span>
                    </h1>
                    <p className="text-slate-400 font-[400]">System Status: <span className="text-blue-500 font-bold uppercase text-[10px] tracking-widest ml-1">Optimal</span></p>
                </div>
            </div>

            {/* Strategic Progress Section */}
            {!loading && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Withdrawal Progress */}
                    <div className="bg-[#0F1E3A] rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-blue-500/20">
                                    Financial Milestone
                                </span>
                                <span className="text-xl md:text-2xl font-bold tracking-tighter">${stats.balance.toFixed(2)} <span className="text-slate-500 text-sm font-medium">/ $25.00</span></span>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl md:text-4xl font-sans font-[300] leading-tight">
                                        You are <span className="font-bold text-blue-400">${amountToWithdrawal.toFixed(2)}</span><br />
                                        away from withdrawal
                                    </h3>
                                    <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-blue-500/30 mb-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2.5 md:h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Progress: {progressPercent.toFixed(1)}%</span>
                                        <span>Threshold: $25.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Bonus */}
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-emerald-100">
                                    Pending Reward
                                </span>
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Zap className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                            </div>

                            <div className="mt-auto space-y-5 md:space-y-6">
                                <div>
                                    <h3 className="text-2xl md:text-4xl font-sans font-[300] text-slate-900 leading-tight">
                                        🎁 <span className="font-bold text-emerald-600">$5.00 Bonus</span><br />
                                        Unlockable Gift
                                    </h3>
                                    <p className="text-slate-400 mt-2 text-sm md:text-base font-medium">Verified reward for active engagement.</p>
                                </div>

                                <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div className="space-y-0.5 md:space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirement</p>
                                        <p className="text-xs md:text-sm font-bold text-slate-700">
                                            {stats.completions_to_unlock > 0
                                                ? `Complete ${stats.completions_to_unlock} more surveys`
                                                : "Unlocked & Credited"}
                                        </p>
                                    </div>
                                    <div className="flex -space-x-1.5 md:-space-x-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${i < (5 - stats.completions_to_unlock) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        {dashboardStats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm shadow-blue-500/5 group hover:border-blue-100 hover:shadow-md transition-all relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${stat.theme.bg} ${stat.theme.border} ${stat.theme.text}`}>
                                        {stat.icon}
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${stat.theme.bg} ${stat.theme.text} ${stat.theme.border}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-sans font-[400] tracking-tighter text-slate-900">{stat.value}</h3>
                                </div>
                            </div>
                        ))}

                        <div
                            className="col-span-1 md:col-span-2 lg:col-span-3 p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm shadow-blue-500/5 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-sans font-[400] tracking-tight text-slate-900 flex items-center gap-2">
                                        Earnings Trend <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    </h3>
                                    <p className="text-slate-400 text-sm font-[400]">Real-time revenue visualization</p>
                                </div>
                            </div>

                            <div className="h-64 w-full relative">
                                <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,250 C100,220 200,280 300,150 C400,180 500,80 600,120 C700,100 800,200 1000,50 L1000,300 L0,300 Z"
                                        fill="url(#chartGrad)"
                                    />
                                    <path
                                        d="M0,250 C100,220 200,280 300,150 C400,180 500,80 600,120 C700,100 800,200 1000,50"
                                        stroke="#2563EB"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </svg>
                                <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                            </div>
                        </div>

                        <div
                            className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm shadow-blue-500/5 flex flex-col"
                        >
                            <h3 className="text-xl font-sans font-[400] text-slate-800 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-500" /> Activity
                            </h3>
                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-900">Recent Activity</h3>
                                    <button className="text-sm text-[#5B6CFF] font-medium hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {stats?.recent_activities?.length > 0 ? (
                                        stats.recent_activities.map((activity, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-slate-900">{activity.description}</h4>
                                                    <p className="text-xs text-slate-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-sm font-bold ${activity.amount > 0 ? 'text-green-500' : 'text-slate-900'}`}>
                                                    {activity.amount > 0 ? '+' : ''}{activity.amount ? `$${activity.amount}` : ''}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomeTab;
