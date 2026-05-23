import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/admin-api';
import {
    Activity, ShieldCheck, Globe, Zap, Loader2, RefreshCcw,
    ArrowUpRight, Target, AlertCircle
} from 'lucide-react';

const AdminPanelAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await adminService.getDashboardStats();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to load panel stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Panel Traffic Intelligence</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time telemetry and success analysis across survey nodes.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Refresh Feed
                </button>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stats.providerStats?.map((provider, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={provider.id || i}
                        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    {provider.name.toLowerCase().includes('zampilia') ? <Zap className="w-6 h-6 text-indigo-500" /> : <Globe className="w-6 h-6 text-indigo-600" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{provider.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Endpoint</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-indigo-600 tracking-tight">{provider.successRate}%</div>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Efficiency Rating</div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 flex-1">
                            {/* Success Meter */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                    <span>Success Threshold</span>
                                    <span>{provider.successful} of {provider.total} attempts</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${provider.successRate}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                                    />
                                </div>
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Target className="w-4 h-4 text-slate-300 mb-2" />
                                    <div className="text-lg font-bold text-slate-900">{provider.total}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Hits</div>
                                </div>
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 mb-2" />
                                    <div className="text-lg font-bold text-emerald-600">{provider.successful}</div>
                                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Verified</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <AlertCircle className="w-4 h-4 text-slate-300 mb-2" />
                                    <div className="text-lg font-bold text-slate-900">{provider.total - provider.successful}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dropped</div>
                                </div>
                            </div>
                        </div>

                        {/* Status Breakdown Section */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Transmission Breakdown</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(provider.breakdown || {}).map(([status, count]) => (
                                    <div key={status} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'complete' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-[11px] font-bold text-slate-600 capitalize">{status}: <span className="text-slate-900">{count}</span></span>
                                    </div>
                                ))}
                                {!Object.keys(provider.breakdown || {}).length && (
                                    <span className="text-[10px] font-bold text-slate-300 italic">No telemetry data available</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Global Insight Card */}
            <div className="bg-indigo-900 rounded-[2.5rem] p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Activity className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">System Reliability Report</h2>
                        <p className="text-indigo-200 text-sm leading-relaxed max-w-md">
                            Your platform nodes are currently maintaining a stable connection with external survey providers.
                            Success rates are within the expected executive benchmark of 15% - 25%.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                            <div className="text-3xl font-black text-white mb-1">99.9%</div>
                            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">API Uptime</div>
                        </div>
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                            <div className="text-3xl font-black text-white mb-1">
                                {((stats.providerStats?.reduce((a, b) => a + (parseFloat(b.successRate) || 0), 0) || 0) / (stats.providerStats?.length || 1)).toFixed(1)}%
                            </div>
                            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Global Conv.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanelAnalytics;
