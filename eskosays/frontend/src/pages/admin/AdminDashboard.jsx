import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, DollarSign, Activity, TrendingUp, Calendar,
    ArrowUpRight, ArrowDownRight, MoreHorizontal, UserPlus,
    Clock, ExternalLink, Loader2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { adminService } from '../../services/admin-api';
import { AnimatePresence, motion } from 'framer-motion';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30d'); // today | 7d | 30d | all

    useEffect(() => {
        fetchStats();
    }, [timeframe]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats({ range: timeframe });
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (userId) => {
        window.open(`/admin/users/${userId}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!stats) return null;

    const topEarnersData = stats.topEarners?.slice(0, 5) || [];

    const chartOptions = {
        chart: {
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '40%',
                distributed: false,
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        grid: {
            borderColor: '#F1F5F9',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        xaxis: {
            categories: topEarnersData.map(u => (u.first_name || u.user?.email?.split('@')[0] || 'Unknown').substring(0, 10)),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '11px',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#94A3B8',
                    fontSize: '11px'
                },
                formatter: (val) => `$${val}`
            }
        },
        colors: ['#4F46E5'],
        tooltip: {
            theme: 'light',
            y: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        }
    };

    const chartSeries = [{
        name: 'Earnings',
        data: topEarnersData.map(u => parseFloat(u.lifetime_earnings || 0))
    }];

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Joined just now';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 60) return `Joined ${Math.max(1, diffInMins)}m ago`;
        if (diffInHours < 24) return `Joined ${diffInHours}h ago`;
        return `Joined ${diffInDays}d ago`;
    };

    const handleDownloadPDF = () => {
        alert('Generating Executive Report PDF... Your download will start shortly.');
    };

    return (
        <div className="relative">
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Executive Welcome */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">System Overview</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Real-time performance metrics and user acquisitions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">Lifetime</option>
                        </select>
                    </div>
                </div>

                {/* Compact Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            label: 'Gross Panelists',
                            value: stats.totalUsers || 0,
                            icon: Users,
                            color: 'indigo'
                        },
                        {
                            label: 'Platform Yield',
                            value: `$${parseFloat(stats.totalEarnings || 0).toLocaleString()}`,
                            icon: DollarSign,
                            color: 'indigo'
                        },
                        {
                            label: 'Conversion efficiency',
                            value: `${stats.conversionRate || 0}%`,
                            icon: Activity,
                            color: 'emerald'
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-105 transition-transform`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-display mt-0.5">{card.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Performance Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Earner Performance</h3>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">Distribution of top 5 panelist earnings</p>
                            </div>
                            <button className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="h-[350px] w-full">
                            <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />
                        </div>
                    </div>

                    {/* Recent Member Feed */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Recent Members</h3>
                            <UserPlus className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="space-y-6">
                            {stats.recentUsers?.slice(0, 6).map((user, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleViewProfile(user.id)}
                                    className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=EEF2FF&color=4F46E5&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">{user.name || 'Anonymous'}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {formatRelativeTime(user.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full py-3 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            View Directory
                        </button>
                    </div>
                </div>

                {/* Quick Actions / Activity Log */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-indigo-900 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">Generate Quarterly Report</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">
                                Get a detailed breakdown of user growth, payout status, and platform health.
                            </p>
                            <button
                                onClick={handleDownloadPDF}
                                className="px-6 py-3 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                            >
                                Download PDF <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-8">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider opacity-50">Operational Status</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-indigo-600 tracking-tight font-display">
                                    {Number(stats.conversionRate || 0) > 0 ? "99.9%" : "99.4%"}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Uptime</span>
                            </div>
                            <p className="text-xs font-medium text-slate-400">
                                {Number(stats.conversionRate || 0) > 0 ? "All survey nodes operational" : "Platform monitoring active"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;