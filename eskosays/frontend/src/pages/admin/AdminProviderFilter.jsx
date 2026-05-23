import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin-api';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, CheckCircle2, XCircle, Power } from 'lucide-react';

const AdminProviderFilter = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await adminService.getProviders();
            if (response.success) {
                setProviders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            setToggling(id);
            const newStatus = !currentStatus;
            const response = await adminService.updateProviderStatus(id, newStatus);
            if (response.success) {
                setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
            }
        } catch (error) {
            console.error('Failed to update provider:', error);
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Control Board</h1>
                    <p className="text-slate-500 font-medium">Control which survey providers are active today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {providers.map((provider) => (
                    <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-3xl border-2 transition-all ${provider.is_active
                                ? 'bg-white border-slate-100 shadow-sm'
                                : 'bg-slate-50 border-slate-200 opacity-80'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${provider.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    <Power className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{provider.name}</h3>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{provider.slug}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <div className={`text-xs font-bold uppercase tracking-tight ${provider.is_active ? 'text-green-600' : 'text-slate-400'
                                        }`}>
                                        {provider.is_active ? 'Online' : 'Paused'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Last updated: {new Date(provider.updated_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggle(provider.id, provider.is_active)}
                                    disabled={toggling === provider.id}
                                    className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-600/10 ${provider.is_active ? 'bg-indigo-600' : 'bg-slate-300'
                                        } ${toggling === provider.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <motion.div
                                        animate={{ x: provider.is_active ? 28 : 4 }}
                                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-[10px]"
                                    >
                                        {toggling === provider.id ? (
                                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                                        ) : null}
                                    </motion.div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-3xl bg-[#0F1E3A] text-white">
                <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-400 mt-1" />
                    <div>
                        <h4 className="font-bold text-lg mb-1">How it works</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Turning off a provider will immediately stop new surveys from that provider from appearing in the user discover tab.
                            Users already in a survey from that provider will still be able to complete it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProviderFilter;
