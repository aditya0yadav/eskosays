import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/admin-api';
import { Loader2, Users, DollarSign, TrendingUp, UserPlus, Activity, Filter, Download, Calendar } from 'lucide-react';
import Chart from 'react-apexcharts';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await adminService.getDashboardStats();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to load stats', error);
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

    const signupData = stats.signupStats?.map(s => ({
        date: new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' }),
        count: s.count
    })) || [];

    // ApexCharts Configuration - Sleek & Professional
    const chartOptions = {
        chart: {
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.25,
                opacityTo: 0.05,
                stops: [0, 90, 100],
            }
        },
        markers: {
            size: 4,
            colors: ['#FFFFFF'],
            strokeColors: '#4F46E5',
            strokeWidth: 2,
            hover: { size: 6 }
        },
        grid: {
            borderColor: '#F1F5F9',
            strokeDashArray: 5,
        },
        xaxis: {
            categories: signupData.map(d => d.date),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#94A3B8',
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
                }
            }
        },
        colors: ['#4F46E5'],
        tooltip: {
            theme: 'light',
            x: { show: true },
        }
    };

    const chartSeries = [{
        name: 'New Registrations',
        data: signupData.map(d => d.count)
    }];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Growth & Performance</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Detailed analysis of user acquisition and engagement trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md">
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Refined Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { label: 'Network Growth', value: stats.totalUsers || 0, icon: Users },
                    { label: 'Active Revenue', value: stats.totalEarnings || 0, icon: Activity }
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Visualization */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Registration Telemetry</h3>
                        <p className="text-xs font-medium text-slate-400">Node acquisition over the last 7-day period</p>
                    </div>
                </div>

                <div className="p-10">
                    <div className="h-[400px] w-full">
                        <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAnalytics;
