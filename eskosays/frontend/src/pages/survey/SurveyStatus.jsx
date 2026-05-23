import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const SurveyStatus = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('survey_status');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const getStatusContent = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-16 h-16 text-emerald-500" />,
                    title: "Excellent Work!",
                    message: "Your mission was successful. Your reward is being processed and will appear in your wallet shortly.",
                    color: "emerald"
                };
            case 'terminate':
                return {
                    icon: <XCircle className="w-16 h-16 text-slate-400" />,
                    title: "Mission Terminated",
                    message: "The survey ended early. Don't worry, there are plenty of other opportunities waiting for you.",
                    color: "slate"
                };
            case 'disqualify':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-orange-400" />,
                    title: "Not a Match",
                    message: "This particular mission wasn't the right fit for your profile. Your effort is still appreciated!",
                    color: "orange"
                };
            case 'overquota':
                return {
                    icon: <Clock className="w-16 h-16 text-cyan-500" />,
                    title: "Mission Full",
                    message: "This survey just reached its limit of participants. We'll find you another one right away.",
                    color: "cyan"
                };
            default:
                return {
                    icon: <Sparkles className="w-16 h-16 text-indigo-500" />,
                    title: "Welcome Back",
                    message: "We're processing your survey results. You'll be back at your dashboard in a moment.",
                    color: "indigo"
                };
        }
    };

    const content = getStatusContent();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 text-center relative overflow-hidden border border-slate-100"
            >
                {/* Background Sparkle Effect */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={status}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="flex flex-col items-center"
                    >
                        <div className="mb-8 p-6 rounded-[2rem] bg-slate-50 relative group">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                {content.icon}
                            </motion.div>
                            <div className="absolute -top-2 -right-2">
                                <span className="flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-25"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-[300] tracking-tight text-slate-900 mb-4 px-2">
                            {content.title}
                        </h1>

                        <p className="text-slate-500 font-[400] leading-relaxed mb-10 px-4">
                            {content.message}
                        </p>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 bg-[#0F1E3A] text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                Back to Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest pt-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Redirecting in {countdown}s
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SurveyStatus;
