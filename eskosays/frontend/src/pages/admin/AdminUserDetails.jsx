import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Mail, Calendar, MapPin, DollarSign, Activity, Clock, Shield, Award, User, Target, BarChart3, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/admin-api';

const AdminUserDetails = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const [fullUser, setFullUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview | profile | activity

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUserDetails(userId);
            if (response.success) {
                setFullUser(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch user details', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !fullUser) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium text-slate-400">Synchronizing panelist data...</p>
                </div>
            </div>
        );
    }

    if (!fullUser) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
                <Target className="w-12 h-12 text-slate-200 mb-4" />
                <h2 className="text-lg font-bold text-slate-900 mb-2">User Not Found</h2>
                <p className="text-sm text-slate-400 mb-6 font-medium">The panelist record you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Member Directory
                </button>
            </div>
        );
    }

    const { profile, financials, stats, attributes, activity_log } = fullUser;

    const earningsData = [
        { name: 'Jan', value: financials.lifetime_earnings * 0.2 },
        { name: 'Feb', value: financials.lifetime_earnings * 0.4 },
        { name: 'Mar', value: financials.lifetime_earnings * 0.5 },
        { name: 'Apr', value: financials.lifetime_earnings * 0.7 },
        { name: 'May', value: financials.lifetime_earnings * 0.9 },
        { name: 'Jun', value: financials.lifetime_earnings }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-indigo-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-slate-400">Directory</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-slate-900">Member Profile</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Main Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-slate-50/30">
                    {/* Header Section */}
                    <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100 z-20">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm transition-transform hover:scale-105 active:scale-95 duration-300">
                                    <User className="w-10 h-10 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{profile.name || 'Anonymous User'}</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                            {profile.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                    Export Data
                                </button>
                                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]">
                                    Direct Message
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            {['overview', 'profile', 'activity'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Performance Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Lifetime Yield', value: `$${financials.lifetime_earnings.toFixed(2)}`, icon: DollarSign, color: 'indigo' },
                                        { label: 'Current Balance', value: `$${financials.balance.toFixed(2)}`, icon: Activity, color: 'emerald' },
                                        { label: 'Quality Score', value: `${stats.quality_score || 100}%`, icon: Shield, color: 'amber' }
                                    ].map((card, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                                                    <card.icon className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                                            <h4 className="text-3xl font-bold text-slate-900 mt-1 font-display tracking-tight">{card.value}</h4>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Area */}
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-96">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider opacity-50">Performance Trajectory</h3>
                                        <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 focus:ring-2 focus:ring-indigo-100">
                                            <option>Last 6 Months</option>
                                            <option>Year to Date</option>
                                        </select>
                                    </div>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <AreaChart data={earningsData}>
                                            <defs>
                                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '16px' }}
                                                formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={4} fill="url(#colorEarnings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {attributes.length > 0 ? (
                                    attributes.map(attr => (
                                        <div key={attr.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors duration-300">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{attr.label}</span>
                                                <p className="text-sm font-bold text-slate-900">{attr.value || 'Not Disclosed'}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                <Target className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <Award className="w-12 h-12 text-slate-100 mb-4" />
                                        <p className="text-slate-400 text-sm font-medium">No persona attributes available for this panelist.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                                {activity_log.length > 0 ? (
                                    activity_log.map(activity => (
                                        <div key={activity.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-600/5 transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                    <BarChart3 className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900 mb-0.5">{activity.survey_title}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(activity.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{activity.id.substring(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end mb-1">
                                                    <span className={`text-lg font-bold ${activity.status === 'complete' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {activity.status === 'complete' ? '+' : ''}${activity.payout.toFixed(2)}
                                                    </span>
                                                    <Award className={`w-4 h-4 ${activity.status === 'complete' ? 'text-emerald-500' : 'text-slate-200'}`} />
                                                </div>
                                                <div className={`inline-flex px-2 px-1 rounded-md text-[9px] font-black uppercase tracking-widest ${activity.status === 'complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {activity.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <Activity className="w-12 h-12 text-slate-100 mb-4" />
                                        <p className="text-slate-400 text-sm font-medium">No survey activity recorded.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Critical Info */}
                <div className="w-full md:w-96 bg-white border-l border-slate-100 p-8 flex flex-col z-30">
                    <div className="mb-10">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Administrative Profile</h3>
                        <div className="h-0.5 w-10 bg-indigo-500 rounded-full" />
                    </div>

                    <div className="space-y-10">
                        <div>
                            <div className="bg-slate-50 p-8 rounded-[32px] space-y-6 border border-slate-100 shadow-inner">
                                {[
                                    { label: 'System Hash', value: `#${profile.id.substring(0, 8)}`, icon: Shield },
                                    { label: 'Last Activity', value: profile.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Never', icon: Clock },
                                    { label: 'Enrollment', value: new Date(profile.joined_at).toLocaleDateString(), icon: Calendar },
                                    { label: 'Trust Level', value: profile.verified ? 'Verified' : 'Unverified', icon: Target },
                                    { label: 'Administrative Role', value: profile.role, icon: User }
                                ].map((info, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                <info.icon className="w-3.5 h-3.5 text-slate-300" />
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-400">{info.label}</span>
                                        </div>
                                        <span className={`text-[11px] font-bold ${info.label === 'Trust Level' ? (profile.verified ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-900'}`}>
                                            {info.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Governing Protocol</h4>
                            <div className="space-y-3">
                                <button className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                                    Issue Compliance Warning
                                </button>
                                <button className="w-full py-4 px-6 bg-white border border-slate-100 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-50 hover:border-red-100 transition-all active:scale-[0.98]">
                                    Terminate Panelist Contract
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto pt-10">
                            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex flex-col items-center text-center shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md mb-4 -mt-12 border border-indigo-50">
                                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h5 className="text-xs font-bold text-indigo-900 mb-1">Total Validated Completions</h5>
                                <p className="text-3xl font-bold text-indigo-600 font-display">{stats.total_surveys}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-2">Lifetime successful conversions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetails;
