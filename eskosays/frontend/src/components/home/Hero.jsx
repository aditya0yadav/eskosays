import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Search, DollarSign, Trophy } from 'lucide-react';
import banner from '../../assets/hero_banner.png';
import panel3 from "../../assets/panel3.png";
import EarningsLiveTicker from './EarningsLiveTicker';

// ── Helpers ──────────────────────────────────────────────────────────────────
const s = (ms) => ({ animationDelay: `${ms}ms`, animationFillMode: 'forwards' });

const TrustBadge = ({ children, className = '' }) => (
    <div className={`bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/60 hover:scale-105 transition-transform duration-500 ${className}`}>
        {children}
    </div>
);

// ── Category config — each has a rate per survey-hour ────────────────────────
const CATEGORIES = [
    { id: 'tech', label: '💻 Tech', rate: 3.80 },
    { id: 'finance', label: '💰 Finance', rate: 4.20 },
    { id: 'health', label: '❤️ Health', rate: 3.10 },
    { id: 'food', label: '🍽️ Food', rate: 2.60 },
    { id: 'lifestyle', label: '✨ Lifestyle', rate: 2.80 },
    { id: 'entertainment', label: '🎬 Entertainment', rate: 2.20 },
];

const calcEarnings = (hours, cats) => {
    if (cats.size === 0) return 0;
    const avgRate = [...cats].reduce((sum, id) => {
        const cat = CATEGORIES.find(c => c.id === id);
        return sum + (cat ? cat.rate : 0);
    }, 0) / cats.size;
    return Math.round(hours * 4.33 * avgRate); // 4.33 weeks/month
};

// ── EarningsCalculator ────────────────────────────────────────────────────────
const EarningsCalculator = () => {
    const [hours, setHours] = useState(5);
    const [selected, setSelected] = useState(new Set(['tech', 'lifestyle']));
    const [displayed, setDisplayed] = useState(0);
    const targetRef = useRef(0);
    const rafRef = useRef(null);

    const target = calcEarnings(hours, selected);

    // Animated count-up whenever target changes
    useEffect(() => {
        targetRef.current = target;
        const start = displayed;
        const diff = target - start;
        if (diff === 0) return;
        const duration = Math.min(Math.abs(diff) * 10, 600); // faster for small diffs
        let startTime = null;

        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(start + diff * eased));
            if (progress < 1) rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    const toggleCat = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                if (next.size === 1) return next; // keep at least one
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const pct = ((hours - 1) / 19) * 100;

    return (
        <div className="mt-12 sm:mt-16 w-full animate-fade-in opacity-0" style={s(750)}>
            <div className="relative bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 sm:p-10 lg:p-12">

                {/* Header */}
                <div className="flex flex-col sm:flex-row lg:items-end justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-8 bg-emerald-400" />
                            <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] font-mono">
                                Earnings Potential
                            </span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F1E3A] tracking-tight leading-[1.1]">
                            How much can <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8]">you</span> <span className="text-emerald-500">earn</span>?
                        </h3>
                    </div>

                    {/* Live earnings display */}
                    <div className="flex items-baseline gap-2 bg-white border border-slate-200 shadow-sm rounded-2xl px-6 py-4">
                        <span className="text-4xl sm:text-5xl font-black text-[#0F1E3A] tabular-nums leading-none tracking-tight">
                            ${displayed}
                        </span>
                        <span className="text-slate-400 font-bold text-sm tracking-wide uppercase">/mo</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Left: Slider */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Time Commitment</span>
                            <span className="text-lg font-black text-[#0F1E3A]">{hours} hours <span className="text-slate-400 font-medium text-sm">/ wk</span></span>
                        </div>
                        {/* Track with gradient fill overlay */}
                        <div className="relative mt-2">
                            <div
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-[6px] rounded-full bg-emerald-400 pointer-events-none transition-all duration-150"
                                style={{ width: `${pct}%` }}
                            />
                            <input
                                type="range"
                                min={1}
                                max={20}
                                value={hours}
                                onChange={e => setHours(Number(e.target.value))}
                                className="calc-slider relative z-10"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-300 tracking-widest mt-4">
                            <span>1 hr</span>
                            <span>20 hrs</span>
                        </div>

                        {/* Contextual label */}
                        <p className="mt-8 text-sm text-slate-500 font-medium leading-relaxed border-l-2 border-emerald-100 pl-4">
                            {hours <= 3 && "🌙 Just a spare hour or two — perfect for earning in breaks."}
                            {hours > 3 && hours <= 8 && "⚡ A few hours a week — great for consistent side income."}
                            {hours > 8 && hours <= 14 && "🚀 You're serious — this puts you in the top earner tier."}
                            {hours > 14 && "💎 Power user! You could rank on our leaderboard."}
                        </p>
                    </div>

                    {/* Right: Category chips */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Select your Interests</p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => {
                                const active = selected.has(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => toggleCat(cat.id)}
                                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 select-none flex items-center flex-1 sm:flex-none justify-center ${active
                                            ? 'bg-[#0F1E3A] text-white border-transparent'
                                            : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        {cat.label}
                                        {active && (
                                            <span className="ml-1 text-white/70 text-xs">+${cat.rate}/hr</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs font-medium text-slate-400 mt-6 flex items-center gap-2 before:w-1 before:h-1 before:rounded-full before:bg-slate-300">
                            Base rates vary by selected industry standards.
                        </p>
                    </div>
                </div>

                {/* Personalized CTA */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-200">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-lg sm:text-xl text-slate-500 font-medium">
                            Potentially <span className="text-emerald-500 font-bold">earn</span> <strong className="text-emerald-500 font-black">${displayed} / mo</strong> at <strong className="text-[#0F1E3A] font-black">{hours} hrs/wk</strong>
                            {selected.size > 0 && (
                                <> solving <strong className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8]">{[...selected].map(id => CATEGORIES.find(c => c.id === id)?.label.split(' ')[1]).filter(Boolean).join(', ')}</strong> problems.</>
                            )}
                        </p>
                    </div>
                    <Link
                        to="/signup"
                        className="group relative flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-lg text-white bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 transition-all duration-300 whitespace-nowrap flex-shrink-0"
                        style={{ textDecoration: 'none' }}
                    >
                        <span>Start Earning</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ── Main Hero Component ────────────────────────────────────────────────────────
const Hero = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        if (window.innerWidth < 1024) return;
        const handleScroll = () => setScrollY(window.pageYOffset);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const steps = [
        { icon: <UserPlus />, title: "Quick Sync", desc: "Connect your profile in 60 seconds. High speed, zero friction." },
        { icon: <Search />, title: "Smart Match", desc: "Our engine finds high-yield surveys based on your unique profile." },
        { icon: <DollarSign />, title: "Instant Credit", desc: "Watch your balance update in real-time as you finish tasks." },
        { icon: <Trophy />, title: "Direct Payout", desc: "No points, no fluff. Real currency sent to your chosen account." }
    ];

    return (
        <>
            {/* Trust bar */}
            <div className='w-full bg-[#5B6CFF] border-b border-blue-700 h-10 shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center'>
                    <span className='text-white text-sm font-medium border-l border-white/50 pl-2 ml-2'>
                        Trusted by leading organizations worldwide
                    </span>
                </div>
            </div>

            {/* ── Hero Section ─────────────────────────────────────────────── */}
            <section className="px-4 sm:px-[4%] py-16 lg:py-20 bg-white relative overflow-hidden">

                <div className="absolute -top-40 -right-20 w-[400px] h-[400px] sm:w-[650px] sm:h-[650px] rounded-full pointer-events-none opacity-60 animate-spin-slow motion-reduce:animate-none"
                    style={{ background: 'radial-gradient(circle, rgba(91,108,255,0.12) 0%, rgba(79,209,232,0.06) 60%, transparent 80%)' }}
                />
                <div className="absolute -bottom-24 -left-24 w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] bg-gradient-to-tr from-indigo-50/50 to-transparent rounded-full blur-[80px] opacity-50 pointer-events-none motion-reduce:animate-none" />

                <div className="max-w-[1400px] mx-auto relative z-10">

                    {/* Main hero grid */}
                    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">

                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-5 rounded-full bg-[#5B6CFF]/8 border border-[#5B6CFF]/20 animate-slide-in-left opacity-0 max-w-full" style={s(0)}>
                                <span className="text-base">👋</span>
                                <span className="text-[#5B6CFF] font-semibold text-xs sm:text-sm tracking-wide truncate">
                                    <span className="sm:hidden">Hi there · 50K+ earning</span>
                                    <span className="hidden sm:inline">Hi there · 50,000+ people already earning</span>
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.1] mb-5 text-[#0F1E3A] tracking-tight">
                                <span className="block animate-slide-up opacity-0" style={s(80)}>
                                    <span className="text-emerald-500">Earn</span> Real Money
                                </span>
                                <span className="block animate-slide-up opacity-0" style={s(220)}>
                                    With Simple{' '}
                                    <span className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8]">
                                        Online Surveys
                                        <span className="absolute left-0 -bottom-1 w-full h-[3px] rounded-full bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] opacity-50" />
                                    </span>
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#0F1E3A]/65 mb-7 max-w-xl animate-fade-in opacity-0" style={s(360)}>
                                Share your opinion. Earn real rewards.{' '}
                                <span className="text-[#0F1E3A]/90 font-semibold">It only takes minutes.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-in opacity-0" style={s(480)}>
                                <Link
                                    to="/signup"
                                    className="group relative w-full sm:w-auto px-6 py-4 sm:px-9 sm:py-5 rounded-full font-black text-lg sm:text-xl text-white bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] shadow-xl shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-105 overflow-hidden text-center"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Start Earning
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4FD1E8] to-[#5B6CFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                                    <div className="absolute inset-0 animate-shimmer pointer-events-none z-10" />
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="px-6 py-3.5 rounded-full font-semibold text-base text-[#5B6CFF] border border-[#5B6CFF]/25 hover:border-[#5B6CFF]/70 hover:bg-[#5B6CFF]/5 transition-all duration-200 text-center"
                                    style={{ textDecoration: 'none' }}
                                >
                                    How it Works
                                </a>
                            </div>

                            {/* Trust signal */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-5 min-w-0 animate-fade-in opacity-0" style={s(600)}>
                                <div className="flex -space-x-2">
                                    {['#5B6CFF', '#4FD1E8', '#22c55e', '#f59e0b', '#ec4899'].map((c, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                                            </svg>
                                        ))}
                                        <span className="text-[#0F1E3A] font-bold text-sm ml-1">4.9</span>
                                    </div>
                                    <p className="text-slate-400 text-xs font-medium">Joined by 50,000+ panelists worldwide</p>
                                </div>
                            </div>
                        </div>

                        {/* Right — desktop only */}
                        <div className="relative hidden lg:flex items-center justify-end">
                            <div
                                className="relative w-full max-w-[720px] animate-fade-in-right opacity-0"
                                style={{ ...s(200), transform: `translateY(${scrollY * 0.07}px)` }}
                            >
                                <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none rounded-full scale-110 pointer-events-none"
                                    style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(91,108,255,0.18) 0%, rgba(79,209,232,0.10) 50%, transparent 70%)' }}
                                />
                                <img
                                    src={banner}
                                    alt="Survey earnings dashboard"
                                    className="relative w-full h-auto object-cover drop-shadow-2xl animate-float-image motion-reduce:animate-none hover:scale-[1.02] transition-transform duration-500"
                                />
                                <div className="absolute -left-10 top-1/4 opacity-0 animate-float-badge-a" style={{ ...s(700), transform: `translateY(${scrollY * -0.02}px)` }}>
                                    <TrustBadge>
                                        <p className="text-2xl font-black text-emerald-500">$14,320</p>
                                        <p className="text-slate-400 text-xs font-semibold mt-0.5">Total paid to members</p>
                                        <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] opacity-70" />
                                    </TrustBadge>
                                </div>
                                <div className="absolute -right-8 bottom-1/4 opacity-0 animate-float-badge-b hidden xl:block" style={{ ...s(700), transform: `translateY(${scrollY * 0.05}px)` }}>
                                    <TrustBadge>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <p className="text-emerald-600 font-bold text-sm">Paid in 24 hrs</p>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium">Instant withdrawal, no minimum</p>
                                    </TrustBadge>
                                </div>
                            </div>
                        </div>

                        {/* Mobile stat cards */}
                        <div className="lg:hidden grid grid-cols-2 gap-4 animate-fade-in opacity-0" style={s(680)}>
                            <div className="bg-[#5B6CFF]/8 border border-[#5B6CFF]/15 rounded-2xl px-4 py-4 text-center">
                                <p className="text-2xl font-black text-emerald-500">$14,320</p>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">Paid to members</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4 text-center">
                                <p className="text-2xl font-black text-emerald-600">24hr</p>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">Fast payout</p>
                            </div>
                        </div>

                    </div>

                    {/* ── Earnings Calculator ─────────────────────────────── */}


                </div>

            </section>

            <EarningsCalculator />

            {/* ── Live Earnings Ticker ─────────────────────────────────────── */}
            <EarningsLiveTicker />

            {/* ── Section 2: How It Works ───────────────────────────────────── */}
            <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-[5%] bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-60 h-60 sm:w-80 sm:h-80 bg-blue-100/40 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-100/30 rounded-full blur-[120px] animate-pulse-slow" style={s(2000)} />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-block px-4 py-1.5 mb-5 rounded-full bg-blue-50 border border-blue-100">
                                <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">Efficiency Protocol</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter mb-5 uppercase">
                                THE <span className="text-brand-gradient">PROCESS.</span>
                            </h2>
                            <p className="text-lg text-slate-600 font-medium border-l-4 border-blue-500 pl-5 leading-relaxed">
                                Experience a seamless transition from insight to earnings with our high-speed monetization engine.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-blue-500/10 border border-blue-50 flex items-center justify-center font-black text-4xl italic text-slate-900 group">
                                <span className="group-hover:scale-110 transition-transform duration-500">4/4</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {steps.map((step, idx) => (
                            <div key={idx} className="group relative bg-white/60 backdrop-blur-xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-white">
                                <span className="absolute top-4 right-4 md:top-6 md:right-8 font-mono font-black text-blue-500/10 group-hover:text-blue-500/30 text-2xl md:text-3xl transition-colors duration-500">0{idx + 1}</span>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tighter">{step.title}</h3>
                                <p className="text-slate-600 font-medium leading-[1.4] text-sm md:text-[15px]">{step.desc}</p>
                                <div className="absolute bottom-5 left-6 right-6 md:bottom-6 md:left-10 md:right-10 h-[3px] bg-brand-gradient opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-500 origin-left rounded-full" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-14 sm:mt-20 flex flex-col items-center">
                        <Link
                            to="/signup"
                            className="group relative inline-flex items-center justify-center gap-4 bg-slate-900 text-white w-full sm:w-auto px-8 py-5 sm:px-12 sm:py-6 rounded-full text-lg sm:text-xl font-bold shadow-2xl shadow-slate-900/20 hover:scale-105 transition-all duration-300"
                            style={{ textDecoration: 'none' }}
                        >
                            <span className="relative z-10">Start Your Journey</span>
                            <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                            <ArrowRight strokeWidth={3} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                        <p className="mt-6 font-bold text-xs uppercase tracking-[0.3em] text-slate-400">Immediate Deployment Ready</p>
                    </div>
                </div>
            </section>

            {/* ── Section 3: Paid Community ─────────────────────────────────── */}
            <section className="px-4 sm:px-[5%] py-16 sm:py-24 bg-gradient-to-br from-orange-50/50 via-white to-blue-50/30 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-orange-100/20 rounded-full blur-[150px] animate-orbital-float" />
                    <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-blue-100/10 rounded-full blur-[120px] animate-orbital-float-reverse" />
                </div>
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-6 sm:space-y-10 animate-fade-in opacity-0" style={s(300)}>
                            <div className="space-y-4">
                                <h2 className="text-[#5B6CFF] font-bold uppercase tracking-widest text-sm">Community Impact</h2>
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F1E3A] leading-[1.15] tracking-tight">
                                    We've Paid Our Community Over <br className="hidden sm:block" />
                                    <span className="text-emerald-500">$14,320</span>
                                </h3>
                            </div>
                            <div className="space-y-4 sm:space-y-6">
                                <p className="text-[#0F1E3A]/70 text-base sm:text-lg md:text-xl leading-relaxed">
                                    Whether you're a student, a professional, or a homemaker, <span className="text-[#0F1E3A] font-medium">Eskosays</span> is the perfect space to monetize your opinions.
                                </p>
                                <p className="text-[#0F1E3A]/70 text-base sm:text-lg md:text-xl leading-relaxed">
                                    Share your insights in your preferred language and grab quick rewards. Every voice matters in our growing global community.
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-12 sm:h-16 w-[2px] bg-gradient-to-b from-orange-500 to-transparent opacity-30" />
                                <p className="text-slate-500 font-medium italic text-sm sm:text-base">
                                    "Join thousands of users turning their spare time into real earnings."
                                </p>
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center lg:justify-end animate-fade-in-right opacity-0" style={{ ...s(600), touchAction: 'manipulation' }}>
                            <div className="absolute inset-0 pointer-events-none hidden sm:block">
                                <div className="absolute top-10 right-0 w-20 h-20 bg-orange-100/50 rounded-2xl rotate-12 blur-sm animate-float z-0" />
                                <div className="absolute bottom-10 left-10 w-16 h-16 bg-blue-100/40 rounded-full animate-float z-30" style={s(1500)} />
                            </div>
                            <div className="relative w-full max-w-[650px] overflow-hidden rounded-2xl mb-8 sm:mb-0">
                                <div className="absolute inset-10 bg-blue-500/5 blur-[80px] rounded-full hidden sm:block" />
                                <img
                                    src={panel3}
                                    alt="Paid Community Illustration"
                                    className="relative w-full h-auto shadow-2xl md:drop-shadow-[0_24px_48px_rgba(0,0,0,0.10)]"
                                />
                                <div className="absolute bottom-2 left-2 sm:-bottom-2 sm:left-0 bg-white/80 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-xl border border-white flex flex-col items-center z-40">
                                    <div className="text-orange-500 font-bold text-2xl mb-0.5">98%</div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Happy Users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;