import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, Zap, ArrowDownLeft, History, Loader2 } from 'lucide-react';
import userService from '../../../services/user.service';

const WalletTab = () => {
    const [wallet, setWallet] = useState({ balance: 0, lifetime_earnings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await userService.getWallet();
                if (response.success) {
                    setWallet(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch wallet:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, []);

    const transactions = [];

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-4xl font-sans font-[300] tracking-tight text-slate-900">Your <span className="text-indigo-600 font-[400]">Wallet</span></h1>
                <p className="text-slate-400 font-[400]">Manage your earnings and secure payouts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet size={160} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 font-bold mb-2 uppercase tracking-widest text-[10px]">Total Available Balance</p>
                            <h2 className="text-6xl font-sans font-[400] tracking-tighter mb-10">
                                {loading ? (
                                    <Loader2 className="w-10 h-10 animate-spin inline-block" />
                                ) : (
                                    `$${(wallet.balance || 0).toFixed(2)}`
                                )}
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    disabled
                                    className="px-8 py-4 rounded-2xl bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                                >
                                    <ArrowDownLeft className="w-4 h-4" /> Withdraw Funds
                                </button>
                                <button className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/20 transition-all border border-white/10">
                                    <History className="w-4 h-4" /> Transaction History
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Tracker */}
                    {!loading && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-sans font-[400] text-slate-900 mb-2">Withdrawal Status</h3>
                                <p className="text-slate-400 text-sm">Minimum withdrawal threshold: <strong>$25.00</strong></p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700">
                                        {wallet.balance >= 25
                                            ? "Threshold Reached"
                                            : `You are $${(25 - wallet.balance).toFixed(2)} away from withdrawal`}
                                    </span>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {Math.min(100, (wallet.balance / 25) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20"
                                        style={{ width: `${Math.min(100, (wallet.balance / 25) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Earnings</p>
                                    <p className="text-2xl font-sans font-[400] text-slate-900">${(wallet.balance || 0).toFixed(2)}</p>
                                </div>
                                <div className="p-6 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Pending Bonus</p>
                                        <Zap className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <p className="text-2xl font-sans font-[400] text-emerald-700">${(wallet.pending_bonus || 0).toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                                        {wallet.completions_count < 5
                                            ? `Unlocks after ${5 - wallet.completions_count} more surveys`
                                            : "Unlocked"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default WalletTab;
