import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    Compass,
    Wallet,
    User,
    Heart,
    Sparkles,
    CheckCircle2,
    Briefcase,
    Calendar,
    Users,
    ArrowRight,
    ChevronLeft,
    ChevronDown
} from 'lucide-react';

import personaService from '../../services/persona.service';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [animationPhase, setAnimationPhase] = useState('star'); // 'star' -> 'content'
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const iconMap = {
        gender: <User className="w-5 h-5" />,
        age: <Calendar className="w-5 h-5" />,
        marital_status: <Heart className="w-5 h-5" />,
        country: <Compass className="w-5 h-5" />,
        zip_code: <Home className="w-5 h-5" />,
        default: <Sparkles className="w-5 h-5" />
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            // Starting to fetch questions
            try {
                const response = await personaService.getQuestions();
                if (response.success) {
                    const demographicKeys = ['gender', 'age', 'marital_status', 'country', 'zip_code']; // Included zip_code
                    const filtered = response.data
                        .filter(q => demographicKeys.includes(q.key))
                        .map(q => ({
                            id: q.key,
                            question: q.title,
                            type: q.type,
                            options: q.options ? q.options.map(opt => ({
                                label: opt,
                                value: opt,
                                icon: iconMap[q.key] || iconMap.default
                            })) : (q.type === 'boolean' ? [
                                { label: 'Yes', value: true, icon: <CheckCircle2 className="w-5 h-5" /> },
                                { label: 'No', value: false, icon: <Sparkles className="w-5 h-5" /> }
                            ] : null) // Return null if no predefined options and not boolean
                        }));

                    setQuestions(filtered);
                    setQuestions(filtered);
                } else {
                    console.warn('Onboarding: Response success was false');
                }
            } catch (error) {
                console.error('Onboarding: Failed to fetch onboarding questions:', error);
            } finally {
                setLoading(false);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setAnimationPhase('star');
        const timer = setTimeout(() => setAnimationPhase('content'), 400);
        setInputValue(''); // Reset input value on step change
        setShowDropdown(false); // Reset dropdown on step change
        return () => clearTimeout(timer);
    }, [step]);

    const handleOptionSelect = async (option) => {
        const currentId = questions[step].id;
        const value = option.value;
        submitResponse(currentId, value);
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const currentId = questions[step].id;
        submitResponse(currentId, inputValue.trim());
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const submitResponse = async (id, value) => {
        const newAnswers = { ...answers, [id]: value };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setIsFinalizing(true);
            try {
                // Save all answers to backend
                await personaService.updateProfile(newAnswers);

                // Longer delay for the final component transition as requested
                setTimeout(() => navigate('/dashboard'), 2500);
            } catch (error) {
                console.error('Failed to save profile on onboarding:', error);
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 space-y-4">
                <Sparkles className="w-12 h-12 text-blue-500/50" />
                <h1 className="text-2xl font-bold text-slate-900">Setting up your profile...</h1>
                <p className="text-slate-500 text-center max-w-md">
                    We're preparing your onboarding questions. This usually takes just a moment.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    const currentQuestion = questions[step];
    const isTextInput = !currentQuestion.options || currentQuestion.options.length === 0;
    const isDropdown = currentQuestion.options && currentQuestion.options.length > 6;

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row font-sans overflow-hidden relative">
            {/* Top Bar for Back Button */}
            <div className="absolute top-8 left-8 z-50">
                {step > 0 && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-semibold">Back</span>
                    </motion.button>
                )}
            </div>

            {/* Left Side: Question Logic */}
            <div className="w-full lg:w-[45%] flex flex-col p-8 lg:px-12 lg:py-24 relative z-20 bg-white">
                <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">

                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex flex-col items-center justify-center space-y-6 py-20"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                                    />
                                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
                                </div>
                                <div className="space-y-2 text-center">
                                    <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                                        {isFinalizing ? "Finishing Setup..." : "Synchronizing..."}
                                    </h2>
                                    <p className="text-slate-400 font-medium tracking-wide text-sm uppercase">
                                        {isFinalizing ? "Preparing your dashboard" : "Aligning your profile"}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-12"
                            >
                                <h1 className="text-4xl lg:text-5xl font-sans font-[300] text-slate-900 leading-[1.3] tracking-[-0.02em] text-center">
                                    {currentQuestion.question.split('').map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: animationPhase === 'content' ? 1 : 0 }}
                                            transition={{ delay: i * 0.01 }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </h1>

                                <motion.div
                                    className="w-full max-w-sm mx-auto"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={animationPhase === 'content' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                    transition={{
                                        delay: (currentQuestion.question.length * 0.01) + 0.5,
                                        duration: 0.5,
                                        ease: "easeOut"
                                    }}
                                >
                                    {isTextInput ? (
                                        <motion.form
                                            onSubmit={handleInputSubmit}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <input
                                                type="text"
                                                autoFocus
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg outline-none"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full p-5 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                Next <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </motion.form>
                                    ) : isDropdown ? (
                                        <div className="space-y-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative group"
                                            >
                                                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors rounded-3xl" />
                                                <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-1 space-y-1">
                                                        {currentQuestion.options.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => handleOptionSelect(option)}
                                                                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-blue-50/50 rounded-2xl transition-all duration-300 group/item"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm group-hover/item:scale-110 group-hover/item:text-blue-600 transition-all">
                                                                        {option.icon}
                                                                    </div>
                                                                    <span className="font-semibold text-slate-700 group-hover/item:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                                                                        {option.label}
                                                                    </span>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-blue-600 group-hover/item:translate-x-1 transition-all opacity-0 group-hover/item:opacity-100" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentQuestion.options.map((option, idx) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-blue-500/80 group-hover:text-blue-600 transition-colors">
                                                            {option.icon}
                                                        </div>
                                                        <span className="text-[17px] font-[400] text-slate-700 font-sans tracking-tight">{option.label}</span>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side: AI Halo Banner */}
            <div className="hidden lg:flex flex-1 bg-slate-50 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/40" />

                {/* Background Textures */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[120px] animate-pulse" />

                {/* AI Halo Visualization */}
                <div className="relative w-[500px] h-[500px] flex items-center justify-center">

                    {/* Pulsing Auras */}
                    <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute inset-20 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

                    {/* The Core Orb */}
                    <motion.div
                        animate={{
                            scale: animationPhase === 'star' ? [1, 1.05, 1] : 1,
                            rotate: 360
                        }}
                        transition={{
                            scale: { repeat: Infinity, duration: 4 },
                            rotate: { repeat: Infinity, duration: 24, ease: "linear" }
                        }}
                        className="relative w-80 h-80"
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_60px_rgba(59,130,246,0.15)]">
                            <defs>
                                <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>

                            {/* Outer Rings */}
                            <circle cx="50" cy="50" r="48" fill="none" stroke="url(#haloGrad)" strokeWidth="0.2" strokeDasharray="6 4" className="opacity-30" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#haloGrad)" strokeWidth="0.1" className="opacity-20" />

                            {/* Pulsing Core */}
                            <motion.circle
                                cx="50" cy="50" r="28"
                                fill="url(#haloGrad)"
                                initial={{ opacity: 0.1 }}
                                animate={{ opacity: [0.05, 0.2, 0.05] }}
                                transition={{ repeat: Infinity, duration: 8 }}
                                filter="blur(15px)"
                            />

                            {/* Center Star */}
                            <path
                                d="M50 20 L56 44 L80 50 L56 56 L50 80 L44 56 L20 50 L44 44 Z"
                                fill="url(#haloGrad)"
                                className="opacity-50 drop-shadow-md"
                            />
                        </svg>

                        {/* Orbiting Data Particles */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full blur-[0.5px]"
                                animate={{
                                    x: [0, Math.cos(i * 72) * 160, 0],
                                    y: [0, Math.sin(i * 72) * 160, 0],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4 + i,
                                    ease: "easeInOut",
                                    delay: i * 0.8
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Status Pill */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200 flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                            {isProcessing ? 'Processing Data' : (animationPhase === 'star' ? 'Active Thinking' : 'Synchronized')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;