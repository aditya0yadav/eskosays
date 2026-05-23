import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Search, DollarSign, Trophy } from 'lucide-react';
import banner from '../../assets/hero_banner.png';
import panel3 from "../../assets/panel3.png";
import EarningsLiveTicker from './EarningsLiveTicker';

// ── Helpers ──────────────────────────────────────────────────────────────────
const s = (ms) => ({ animationDelay: `${ms}ms`, animationFillMode: 'forwards' });

// ── Category config ───────────────────────────────────────────────────────────
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
    return Math.round(hours * 4.33 * avgRate);
};

// ── EarningsCalculator ────────────────────────────────────────────────────────
const EarningsCalculator = () => {
    const [hours, setHours] = useState(5);
    const [selected, setSelected] = useState(new Set(['tech', 'lifestyle']));
    const [displayed, setDisplayed] = useState(0);
    const targetRef = useRef(0);
    const rafRef = useRef(null);

    const target = calcEarnings(hours, selected);

    useEffect(() => {
        targetRef.current = target;
        const start = displayed;
        const diff = target - start;
        if (diff === 0) return;
        const duration = Math.min(Math.abs(diff) * 10, 600);
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
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
                if (next.size === 1) return next;
                next.delete(id);
            } else { next.add(id); }
            return next;
        });
    };

    const pct = ((hours - 1) / 19) * 100;

    return (
        <div className="mt-12 sm:mt-16 w-full animate-fade-in opacity-0" style={s(750)}>
            <div className="relative bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 sm:p-10 lg:p-12">
                <div className="flex flex-col sm:flex-row lg:items-end justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-8 bg-emerald-400" />
                            <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] font-mono">Earnings Potential</span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F1E3A] tracking-tight leading-[1.1]">
                            How much can <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0022FF, #4FD1E8)' }}>you</span>{' '}
                            <span className="text-emerald-500">earn</span>?
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2 bg-white border border-slate-200 shadow-sm rounded-2xl px-6 py-4">
                        <span className="text-4xl sm:text-5xl font-black text-[#0F1E3A] tabular-nums leading-none tracking-tight">${displayed}</span>
                        <span className="text-slate-400 font-bold text-sm tracking-wide uppercase">/mo</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Time Commitment</span>
                            <span className="text-lg font-black text-[#0F1E3A]">{hours} hours <span className="text-slate-400 font-medium text-sm">/ wk</span></span>
                        </div>
                        <div className="relative mt-8 mb-2">
                            {/* Floating Tooltip Bubble */}
                            <div className="absolute bottom-full mb-3 left-0 transition-all duration-150 ease-out pointer-events-none"
                                style={{ left: `calc(${pct}% - 22px)` }}
                            >
                                <div className="bg-[#0022FF] text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-lg relative tracking-wider flex items-center gap-1">
                                    <span>{hours}h</span>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0022FF] rotate-45 -translate-y-1" />
                            </div>

                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[6px] rounded-full pointer-events-none transition-all duration-150"
                                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0022FF, #4FD1E8)' }}
                            />
                            <input type="range" min={1} max={20} value={hours}
                                onChange={e => setHours(Number(e.target.value))}
                                className="calc-slider relative z-10"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-300 tracking-widest mt-4">
                            <span>1 hr</span><span>20 hrs</span>
                        </div>
                        <p className="mt-8 text-sm text-slate-500 font-medium leading-relaxed border-l-2 border-blue-100 pl-4">
                            {hours <= 3 && "🌙 Just a spare hour or two — perfect for earning in breaks."}
                            {hours > 3 && hours <= 8 && "⚡ A few hours a week — great for consistent side income."}
                            {hours > 8 && hours <= 14 && "🚀 You're serious — this puts you in the top earner tier."}
                            {hours > 14 && "💎 Power user! You could rank on our leaderboard."}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Select your Interests</p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => {
                                const active = selected.has(cat.id);
                                return (
                                    <button key={cat.id} onClick={() => toggleCat(cat.id)}
                                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 select-none flex items-center flex-1 sm:flex-none justify-center ${active
                                            ? 'text-white scale-105 shadow-[0_8px_20px_rgba(0,34,255,0.22)] border-transparent'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:translate-y-[-1px]'
                                        }`}
                                        style={active ? { background: 'linear-gradient(135deg, #0022FF, #0044ff)' } : {}}
                                    >
                                        {cat.label}
                                        {active && <span className="ml-1.5 text-white/80 text-[11px] font-extrabold bg-white/10 px-1.5 py-0.5 rounded-md">+${cat.rate}</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs font-medium text-slate-400 mt-6 flex items-center gap-2 before:w-1 before:h-1 before:rounded-full before:bg-slate-300">
                            Base rates vary by selected industry standards.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-200">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-lg sm:text-xl text-slate-500 font-medium">
                            Potentially <span className="text-emerald-500 font-bold">earn</span>{' '}
                            <strong className="text-emerald-500 font-black">${displayed} / mo</strong> at{' '}
                            <strong className="text-[#0F1E3A] font-black">{hours} hrs/wk</strong>
                            {selected.size > 0 && (
                                <> solving <strong className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0022FF, #4FD1E8)' }}>{[...selected].map(id => CATEGORIES.find(c => c.id === id)?.label.split(' ')[1]).filter(Boolean).join(', ')}</strong> problems.</>
                            )}
                        </p>
                    </div>
                    <Link to="/signup"
                        className="group relative flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-lg text-white shadow-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 hover:-translate-y-1 hover:shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #0022FF, #0044ff)', boxShadow: '0 8px 30px rgba(0,34,255,0.25)', textDecoration: 'none' }}
                    >
                        <span>Start Earning</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ── Full-Width Constellation Background (spans entire hero section) ────────────
const ConstellationBackground = () => (
    <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ zIndex: 0 }}
    >
        {/* Nodes — spread across the full section */}
        {[
            [60, 80], [180, 40], [320, 120], [480, 30], [620, 90], [760, 50], [900, 110], [1050, 40], [1180, 90],
            [120, 200], [280, 250], [440, 180], [580, 260], [720, 200], [860, 250], [1000, 190], [1140, 240],
            [50, 360], [200, 400], [370, 330], [520, 410], [670, 350], [820, 400], [970, 340], [1120, 390],
            [140, 520], [310, 480], [460, 540], [610, 490], [750, 540], [890, 480], [1040, 520],
            [80, 580], [240, 600], [400, 570], [560, 610], [700, 580], [850, 610], [1000, 570], [1150, 600],
        ].map(([cx, cy], i) => (
            <g key={i}>
                <circle cx={cx} cy={cy} r={i % 5 === 0 ? 2.5 : 1.8} fill="rgba(0,34,255,0.18)" />
                <circle cx={cx} cy={cy} r={i % 5 === 0 ? 8 : 5} fill="rgba(0,34,255,0.05)" />
            </g>
        ))}
        {/* Connection lines — triangulated */}
        {[
            [60,80,180,40],[180,40,320,120],[320,120,480,30],[480,30,620,90],[620,90,760,50],[760,50,900,110],[900,110,1050,40],[1050,40,1180,90],
            [60,80,120,200],[180,40,120,200],[180,40,280,250],[320,120,280,250],[320,120,440,180],[480,30,440,180],[480,30,580,260],[620,90,580,260],[620,90,720,200],[760,50,720,200],[760,50,860,250],[900,110,860,250],[900,110,1000,190],[1050,40,1000,190],[1050,40,1140,240],[1180,90,1140,240],
            [120,200,50,360],[120,200,200,400],[280,250,200,400],[280,250,370,330],[440,180,370,330],[440,180,520,410],[580,260,520,410],[580,260,670,350],[720,200,670,350],[720,200,820,400],[860,250,820,400],[860,250,970,340],[1000,190,970,340],[1000,190,1120,390],[1140,240,1120,390],
            [50,360,140,520],[200,400,140,520],[200,400,310,480],[370,330,310,480],[370,330,460,540],[520,410,460,540],[520,410,610,490],[670,350,610,490],[670,350,750,540],[820,400,750,540],[820,400,890,480],[970,340,890,480],[970,340,1040,520],[1120,390,1040,520],
            [140,520,80,580],[140,520,240,600],[310,480,240,600],[310,480,400,570],[460,540,400,570],[460,540,560,610],[610,490,560,610],[610,490,700,580],[750,540,700,580],[750,540,850,610],[890,480,850,610],[890,480,1000,570],[1040,520,1000,570],[1040,520,1150,600],
        ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,34,255,0.09)" strokeWidth="0.9"
            />
        ))}
    </svg>
);

// ── Soft Angular Geometric Shapes (light, non-dominant) ───────────────────────
const GeometricShapes = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {/* Primary angular shape — large right-pointing chevron, very soft */}
        <svg
            className="absolute"
            style={{ top: '-5%', right: '-2%', width: '58%', height: '110%' }}
            viewBox="0 0 580 650"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="chevronGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0022FF" stopOpacity="0.18" />
                    <stop offset="60%" stopColor="#4466FF" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="chevronGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0022FF" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.04" />
                </linearGradient>
            </defs>
            {/* Main chevron polygon */}
            <polygon
                points="160,0 580,0 580,650 160,650 0,325"
                fill="url(#chevronGrad1)"
            />
            {/* Secondary smaller offset polygon for depth */}
            <polygon
                points="260,80 560,80 560,570 260,570 120,325"
                fill="url(#chevronGrad2)"
            />
            {/* Sharp left edge accent line */}
            <polyline
                points="0,325 160,0 580,0"
                fill="none"
                stroke="rgba(0,34,255,0.20)"
                strokeWidth="1.5"
            />
            <polyline
                points="0,325 160,650 580,650"
                fill="none"
                stroke="rgba(0,34,255,0.12)"
                strokeWidth="1"
            />
            {/* Inner edge accent */}
            <polyline
                points="120,325 260,80 560,80"
                fill="none"
                stroke="rgba(79,209,232,0.18)"
                strokeWidth="1"
                strokeDasharray="6 4"
            />
        </svg>
    </div>
);

// ── Floating White Glass Card ─────────────────────────────────────────────────
const WhiteGlassCard = ({ children, style }) => (
    <div
        className="absolute rounded-2xl"
        style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.90)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(0,34,255,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            ...style,
        }}
    >
        {children}
    </div>
);

// ── Right Side Composite Visual ───────────────────────────────────────────────
const HeroVisual = ({ scrollY, mousePos }) => {
    const mx = mousePos?.x || 0;
    const my = mousePos?.y || 0;

    return (
        <div className="relative w-full" style={{ zIndex: 2, height: '580px' }}>

            {/* Soft ambient glow blobs — pure brand blue */}
            <div className="absolute pointer-events-none transition-transform duration-700 ease-out" style={{
                top: '5%', left: '5%', width: '380px', height: '380px', zIndex: 1,
                background: 'radial-gradient(circle, rgba(0,34,255,0.06) 0%, transparent 65%)',
                filter: 'blur(70px)',
                transform: `translate(${mx * 25}px, ${my * 25}px)`,
            }} />
            <div className="absolute pointer-events-none transition-transform duration-700 ease-out" style={{
                bottom: '5%', right: '0%', width: '250px', height: '250px', zIndex: 1,
                background: 'radial-gradient(circle, rgba(0,34,255,0.05) 0%, transparent 65%)',
                filter: 'blur(50px)',
                transform: `translate(${mx * -20}px, ${my * -20}px)`,
            }} />

            {/* ── Illustration — position wrapper (no animation) + inner float wrapper ─── */}
            <div
                className="transition-transform duration-300 ease-out"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translateY(${scrollY * 0.04}px) translate(${mx * 12}px, ${my * 12}px)`,
                    width: '100%',
                    maxWidth: '560px',
                    zIndex: 3,
                }}
            >
                <div className="animate-float-image">
                    <img
                        src={banner}
                        alt="Survey earnings dashboard"
                        className="w-full h-auto object-contain"
                        style={{
                            filter: 'drop-shadow(0 20px 40px rgba(0,34,255,0.12))',
                        }}
                    />
                </div>
            </div>

            {/* ── Single floating badge — top right, unobtrusive ─── */}
            <WhiteGlassCard style={{
                top: '4%',
                right: '2%',
                padding: '10px 14px',
                minWidth: '160px',
                zIndex: 4,
                animation: 'float-badge-b 7s ease-in-out infinite',
                transform: `translate(${mx * -25}px, ${my * -25}px)`,
                transition: 'transform 0.2s ease-out',
            }}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block flex-shrink-0" />
                    <p className="text-[#0F1E3A] font-bold text-sm">Paid in 24 hrs</p>
                </div>
                <p className="text-slate-400 text-[11px] font-medium">Instant withdrawal, no minimum</p>
            </WhiteGlassCard>
        </div>
    );
};

// ── Main Hero Component ────────────────────────────────────────────────────────
const Hero = () => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (window.innerWidth < 1024) return;
        const handleScroll = () => setScrollY(window.pageYOffset);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) return;
        const handleMouseMove = (e) => {
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const steps = [
        { icon: <UserPlus />, title: "Quick Sync", desc: "Connect your profile in 60 seconds. High speed, zero friction." },
        { icon: <Search />, title: "Smart Match", desc: "Our engine finds high-yield surveys based on your unique profile." },
        { icon: <DollarSign />, title: "Instant Credit", desc: "Watch your balance update in real-time as you finish tasks." },
        { icon: <Trophy />, title: "Direct Payout", desc: "No points, no fluff. Real currency sent to your chosen account." }
    ];

    return (
        <>
            {/* ── Hero Section ──────────────────────────────────────────────── */}
            <section
                className="px-4 sm:px-[4%] py-16 lg:py-20 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)' }}
            >
                {/* 3D Perspective Grid Floor */}
                <div className="perspective-grid" />

                {/* ── Full-width constellation spans the entire hero section ── */}
                <ConstellationBackground />

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">

                        {/* ── Left Side Content ─────────────────────────────── */}
                        <div>
                            {/* Social proof pill */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full animate-fade-in-right opacity-0 max-w-full"
                                style={{
                                    ...s(0),
                                    background: 'rgba(0,34,255,0.07)',
                                    border: '1px solid rgba(0,34,255,0.18)',
                                }}
                            >
                                <span className="text-base">👋</span>
                                <span className="font-semibold text-xs sm:text-sm tracking-wide truncate" style={{ color: '#0022FF' }}>
                                    <span className="sm:hidden">Hi there · 50K+ earning</span>
                                    <span className="hidden sm:inline">Hi there · 50,000+ people already earning</span>
                                </span>
                            </div>

                            {/* Main heading */}
                            <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.1] mb-5 text-[#0F1E3A] tracking-tight">
                                <span className="block animate-fade-in-right opacity-0" style={s(120)}>
                                    Earn Real Money With Simple
                                </span>
                                <span className="block animate-fade-in-right opacity-0" style={s(240)}>
                                    <span
                                        className="relative inline-block text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #0022FF 0%, #4FD1E8 100%)' }}
                                    >
                                        Online Surveys
                                        <span className="absolute left-0 -bottom-1 w-full h-[3px] rounded-full opacity-40"
                                            style={{ background: 'linear-gradient(90deg, #0022FF, #4FD1E8)' }}
                                        />
                                    </span>
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[#0F1E3A]/65 mb-8 max-w-xl animate-fade-in-right opacity-0" style={s(360)}>
                                Share your opinion. Earn real rewards.{' '}
                                <span className="text-[#0F1E3A]/90 font-semibold">It only takes minutes.</span>
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-in-right opacity-0" style={s(480)}>
                                {/* Primary CTA — solid pill, brand blue */}
                                <Link
                                    to="/signup"
                                    className="group relative w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-lg sm:text-xl text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-center overflow-hidden"
                                    style={{
                                        background: '#0022FF',
                                        boxShadow: '0 8px 30px rgba(0,34,255,0.30)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Start Earning →
                                        <span className="hidden"></span>
                                    </span>
                                    {/* Hover shimmer */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: 'linear-gradient(135deg, #0033ff 0%, #0011cc 100%)' }}
                                    />
                                </Link>

                                {/* Secondary CTA — outlined pill */}
                                <a
                                    href="#how-it-works"
                                    className="px-7 py-4 rounded-full font-semibold text-base border-2 transition-all duration-200 text-center"
                                    style={{
                                        borderColor: '#0F1E3A',
                                        color: '#0F1E3A',
                                        background: 'transparent',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(15,30,58,0.06)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    How it Works
                                </a>
                            </div>

                            {/* Trust ratings */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-6 min-w-0 animate-fade-in-right opacity-0" style={s(600)}>
                                <div className="flex -space-x-2">
                                    {['#0022FF', '#4FD1E8', '#22c55e', '#f59e0b', '#ec4899'].map((c, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                                            style={{ background: c }}>
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

                        {/* ── Right Side — Desktop: 3-Layer Composite Visual ── */}
                        <div className="relative hidden lg:block animate-slide-up opacity-0" style={s(750)}>
                            <HeroVisual scrollY={scrollY} mousePos={mousePos} />
                        </div>

                        {/* ── Mobile stat cards (right side hidden on mobile) ── */}
                        <div className="lg:hidden grid grid-cols-2 gap-4 animate-slide-up opacity-0" style={s(720)}>
                            <div className="rounded-2xl px-4 py-4 text-center"
                                style={{ background: 'rgba(0,34,255,0.07)', border: '1px solid rgba(0,34,255,0.12)' }}>
                                <p className="text-2xl font-black text-emerald-500">$14,320</p>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">Paid to members</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4 text-center">
                                <p className="text-2xl font-black text-emerald-600">24hr</p>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">Fast payout</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── Live Earnings Ticker ──────────────────────────────────────── */}
            <EarningsLiveTicker />

            {/* ── Section 2: How It Works ───────────────────────────────────── */}
            <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-[5%] bg-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    {/* Ambient glow blobs */}
                    <div className="absolute top-1/4 -left-20 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-100/20 rounded-full blur-[120px] animate-pulse-slow" style={s(2000)} />
                    
                    {/* Mirror-symmetric chevron/polygon elements on the left side (pointing right) */}
                    <svg
                        className="absolute"
                        style={{ top: '10%', left: '-5%', width: '45%', height: '80%', opacity: 0.8 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s2ChevronGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.14" />
                                <stop offset="60%" stopColor="#4466FF" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.03" />
                            </linearGradient>
                            <linearGradient id="s2ChevronGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="0,0 280,0 420,325 280,650 0,650"
                            fill="url(#s2ChevronGrad1)"
                        />
                        <polygon
                            points="0,80 180,80 300,325 180,570 0,570"
                            fill="url(#s2ChevronGrad2)"
                        />
                        <polyline
                            points="0,0 280,0 420,325 280,650"
                            fill="none"
                            stroke="rgba(0,34,255,0.15)"
                            strokeWidth="1.5"
                        />
                        <polyline
                            points="0,80 180,80 300,325 180,570"
                            fill="none"
                            stroke="rgba(79,209,232,0.15)"
                            strokeWidth="1"
                            strokeDasharray="6 4"
                        />
                    </svg>

                    {/* Mirror-symmetric chevron/polygon elements on the right side (pointing left) */}
                    <svg
                        className="absolute"
                        style={{ bottom: '5%', right: '-5%', width: '45%', height: '85%', opacity: 0.7 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s2ChevronGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.10" />
                                <stop offset="60%" stopColor="#4466FF" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="450,0 170,0 30,325 170,650 450,650"
                            fill="url(#s2ChevronGrad3)"
                        />
                        <polyline
                            points="450,0 170,0 30,325 170,650"
                            fill="none"
                            stroke="rgba(0,34,255,0.12)"
                            strokeWidth="1.5"
                        />
                        <polyline
                            points="450,80 270,80 130,325 270,570"
                            fill="none"
                            stroke="rgba(79,209,232,0.12)"
                            strokeWidth="1"
                            strokeDasharray="5 3"
                        />
                    </svg>

                    {/* Section 2 Custom Constellation Background - connecting nodes for visual coherence */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1440 800"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Connection lines */}
                        {[
                            [150, 100, 300, 60], [300, 60, 480, 120], [480, 120, 650, 50], [650, 50, 820, 110], [820, 110, 1000, 40], [1000, 40, 1180, 90], [1180, 90, 1350, 50],
                            [150, 100, 220, 240], [300, 60, 220, 240], [300, 60, 380, 220], [480, 120, 380, 220], [480, 120, 560, 260], [650, 50, 560, 260], [650, 50, 720, 200], [820, 110, 720, 200], [820, 110, 900, 250], [1000, 40, 900, 250], [1000, 40, 1080, 210], [1180, 90, 1080, 210], [1180, 90, 1260, 240], [1350, 50, 1260, 240],
                            [220, 240, 100, 380], [220, 240, 280, 400], [380, 220, 280, 400], [380, 220, 460, 360], [560, 260, 460, 360], [560, 260, 640, 420], [720, 200, 640, 420], [720, 200, 800, 340], [900, 250, 800, 340], [900, 250, 980, 410], [1080, 210, 980, 410], [1080, 210, 1160, 330], [1260, 240, 1160, 330], [1260, 240, 1340, 390],
                            [100, 380, 180, 560], [280, 400, 180, 560], [280, 400, 360, 520], [460, 360, 360, 520], [460, 360, 520, 580], [640, 420, 520, 580], [640, 420, 700, 500], [800, 340, 700, 500], [800, 340, 880, 590], [980, 410, 880, 590], [980, 410, 1060, 510], [1160, 330, 1060, 510], [1160, 330, 1240, 570], [1340, 390, 1240, 570],
                            [180, 560, 260, 700], [360, 520, 260, 700], [360, 520, 440, 680], [520, 580, 440, 680], [520, 580, 600, 710], [700, 500, 600, 710], [700, 500, 780, 670], [880, 590, 780, 670], [880, 590, 960, 720], [1060, 510, 960, 720], [1060, 510, 1140, 680], [1240, 570, 1140, 680]
                        ].map(([x1, y1, x2, y2], i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="rgba(0,34,255,0.06)" strokeWidth="0.8"
                            />
                        ))}
                        {/* Nodes */}
                        {[
                            [150, 100], [300, 60], [480, 120], [650, 50], [820, 110], [1000, 40], [1180, 90], [1350, 50],
                            [220, 240], [380, 220], [560, 260], [720, 200], [900, 250], [1080, 210], [1260, 240],
                            [100, 380], [280, 400], [460, 360], [640, 420], [800, 340], [980, 410], [1160, 330], [1340, 390],
                            [180, 560], [360, 520], [520, 580], [700, 500], [880, 590], [1060, 510], [1240, 570],
                            [260, 700], [440, 680], [600, 710], [780, 670], [960, 720], [1140, 680]
                        ].map(([cx, cy], i) => (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r={i % 6 === 0 ? 2.5 : 1.8} fill="rgba(0,34,255,0.15)" />
                                <circle cx={cx} cy={cy} r={i % 6 === 0 ? 8 : 5} fill="rgba(0,34,255,0.03)" />
                            </g>
                        ))}
                    </svg>
                    
                    {/* Geometric background grid */}
                    <svg className="absolute top-10 left-10 w-48 h-48 opacity-[0.06] text-blue-500" viewBox="0 0 100 100">
                        <defs>
                            <pattern id="gridS2" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#gridS2)" />
                    </svg>
                    
                    {/* Floating outline hexagon */}
                    <svg className="absolute top-1/3 right-12 w-28 h-28 opacity-[0.06] text-blue-600 animate-float" viewBox="0 0 100 100">
                        <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    
                    {/* Large background diamond line */}
                    <svg className="absolute -bottom-10 left-1/4 w-80 h-80 opacity-[0.03] text-blue-600" viewBox="0 0 100 100">
                        <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-block px-4 py-1.5 mb-5 rounded-full bg-blue-50 border border-blue-100">
                                <span className="text-[#0022FF] text-xs font-bold uppercase tracking-[0.2em] font-mono">Efficiency Protocol</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter mb-5 uppercase">
                                THE <span className="text-brand-gradient">PROCESS.</span>
                            </h2>
                            <p className="text-lg text-slate-600 font-medium border-l-4 border-[#0022FF] pl-5 leading-relaxed">
                                Experience a seamless transition from insight to earnings with our high-speed monetization engine.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-blue-500/10 border border-blue-50 flex items-center justify-center font-black text-4xl italic text-slate-900 group">
                                <span className="group-hover:scale-110 transition-transform duration-500">4/4</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="group relative bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-white overflow-hidden flex flex-col justify-between">
                                <div>
                                    {/* Hover background glow gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0022FF]/[0.02] to-[#4FD1E8]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Step number with spinning border */}
                                    <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center justify-center w-12 h-12">
                                        <span className="font-mono font-black text-[#0022FF]/10 group-hover:text-[#0022FF]/40 text-2xl md:text-3xl transition-all duration-300 relative z-10 group-hover:scale-110">0{idx + 1}</span>
                                        <div className="absolute inset-0 rounded-full border border-dashed border-[#0022FF]/30 animate-spin-slow opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100" />
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tighter relative z-10">{step.title}</h3>
                                    <p className="text-slate-500 font-medium leading-[1.4] text-xs sm:text-sm relative z-10 mb-4">{step.desc}</p>
                                </div>

                                {/* Step Visual Mockups */}
                                {idx === 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center min-h-[120px] relative z-10">
                                        <div className="w-full max-w-[200px] bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                                            <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700">
                                                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-[8px] font-black">G</span>
                                                Connect Google
                                            </div>
                                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-bold text-emerald-700 animate-pulse">
                                                <span>✓ Synced & Verified</span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {idx === 1 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col justify-center min-h-[120px] relative z-10">
                                        <div className="w-full max-w-[210px] mx-auto flex flex-col gap-2">
                                            <div className="bg-white border border-slate-150 p-2.5 rounded-xl shadow-sm flex items-center justify-between text-[10px] hover:translate-y-[-1px] transition-transform">
                                                <div>
                                                    <p className="font-bold text-slate-800">💻 AI Tech Survey</p>
                                                    <p className="text-[8px] text-slate-400">10 mins · $4.50</p>
                                                </div>
                                                <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full">98% Match</span>
                                            </div>
                                            <div className="bg-white/60 border border-slate-100 p-2.5 rounded-xl shadow-sm flex items-center justify-between text-[10px] opacity-75">
                                                <div>
                                                    <p className="font-bold text-slate-800">🍔 Food Habits</p>
                                                    <p className="text-[8px] text-slate-400">5 mins · $2.10</p>
                                                </div>
                                                <span className="bg-blue-500/10 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full">92% Match</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {idx === 2 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center min-h-[120px] relative z-10">
                                        <div className="w-full max-w-[180px] bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Balance</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xl font-black text-slate-800">$34.20</span>
                                                <span className="text-emerald-500 font-bold text-xs animate-bounce">+$4.50</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className="bg-emerald-400 h-full rounded-full animate-pulse" style={{ width: '80%' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {idx === 3 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center min-h-[120px] relative z-10">
                                        <div className="w-full max-w-[190px] bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-sm flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between text-[10px] w-full">
                                                <span className="font-bold text-slate-650">PayPal payout</span>
                                                <span className="text-emerald-500 font-extrabold text-[8px] uppercase tracking-wider animate-pulse">Sent ⚡</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[9px] bg-white border border-slate-150 p-2 rounded-lg w-full">
                                                <span className="text-slate-450">Txn ID: #EK-9824</span>
                                                <span className="font-bold text-slate-700">$38.70</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gradient opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-500 origin-left rounded-full" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-14 sm:mt-20 flex flex-col items-center">
                        <Link
                            to="/signup"
                            className="group relative inline-flex items-center justify-center gap-4 text-white w-full sm:w-auto px-8 py-5 sm:px-12 sm:py-6 rounded-full text-lg sm:text-xl font-bold shadow-2xl shadow-blue-900/20 hover:scale-105 transition-all duration-300"
                            style={{ background: '#0022FF', textDecoration: 'none' }}
                        >
                            <span className="relative z-10">Start Your Journey</span>
                            <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                            <ArrowRight strokeWidth={3} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                        <p className="mt-6 font-bold text-xs uppercase tracking-[0.3em] text-slate-400">Immediate Deployment Ready</p>
                    </div>
                </div>
            </section>

            {/* ── Section 3: Earnings Estimator (Standalone Section) ────────── */}
            <section id="earnings-estimator" className="py-16 sm:py-24 px-4 sm:px-[5%] bg-slate-50 border-t border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-100/20 rounded-full blur-[110px]" />
                    <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-emerald-100/10 rounded-full blur-[100px]" />
                    
                    {/* Left chevron pointer (pointing right) */}
                    <svg
                        className="absolute"
                        style={{ top: '10%', left: '-5%', width: '45%', height: '80%', opacity: 0.7 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s3ChevronGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.10" />
                                <stop offset="60%" stopColor="#4466FF" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="0,0 280,0 420,325 280,650 0,650"
                            fill="url(#s3ChevronGrad1)"
                        />
                        <polyline
                            points="0,0 280,0 420,325 280,650"
                            fill="none"
                            stroke="rgba(0,34,255,0.10)"
                            strokeWidth="1.2"
                        />
                    </svg>

                    {/* Right chevron pointer (pointing left) */}
                    <svg
                        className="absolute"
                        style={{ bottom: '10%', right: '-5%', width: '45%', height: '80%', opacity: 0.6 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s3ChevronGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="450,0 170,0 30,325 170,650 450,650"
                            fill="url(#s3ChevronGrad2)"
                        />
                        <polyline
                            points="450,0 170,0 30,325 170,650"
                            fill="none"
                            stroke="rgba(79,209,232,0.12)"
                            strokeWidth="1.2"
                        />
                    </svg>

                    {/* Constellation overlay */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1440 800"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {[
                            [200, 150, 350, 80], [350, 80, 520, 170], [520, 170, 700, 90], [700, 90, 880, 140], [880, 140, 1050, 70], [1050, 70, 1220, 150],
                            [350, 80, 280, 290], [520, 170, 440, 270], [700, 90, 620, 320], [880, 140, 800, 260], [1050, 70, 970, 290],
                            [280, 290, 440, 270], [440, 270, 620, 320], [620, 320, 800, 260], [800, 260, 970, 290]
                        ].map(([x1, y1, x2, y2], i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="rgba(0,34,255,0.04)" strokeWidth="0.8"
                            />
                        ))}
                        {[
                            [200, 150], [350, 80], [520, 170], [700, 90], [880, 140], [1050, 70], [1220, 150],
                            [280, 290], [440, 270], [620, 320], [800, 260], [970, 290]
                        ].map(([cx, cy], i) => (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r={1.8} fill="rgba(0,34,255,0.12)" />
                                <circle cx={cx} cy={cy} r={5} fill="rgba(0,34,255,0.03)" />
                            </g>
                        ))}
                    </svg>

                    {/* Background grid accent */}
                    <svg className="absolute top-1/2 left-10 -translate-y-1/2 w-48 h-48 opacity-[0.04] text-slate-800" viewBox="0 0 100 100">
                        <defs>
                            <pattern id="gridS3" width="16" height="16" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="16" y2="0" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="0" y1="0" x2="0" y2="16" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#gridS3)" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-block px-4 py-1.5 mb-5 rounded-full bg-emerald-50 border border-emerald-100">
                            <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] font-mono">Yield Calculator</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-[#0F1E3A] leading-[1.1] tracking-tight uppercase mb-5">
                            Estimate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0022FF] to-[#4FD1E8]">Monthly Yield</span>
                        </h2>
                        <p className="text-base text-slate-500 font-semibold leading-relaxed max-w-lg mx-auto">
                            Adjust the time commitment and interests to simulate your average monthly payouts.
                        </p>
                    </div>
                    <EarningsCalculator />
                </div>
            </section>

            {/* ── Section 4: Paid Community ─────────────────────────────────── */}
            <section className="px-4 sm:px-[5%] py-16 sm:py-24 bg-gradient-to-br from-orange-50/50 via-white to-blue-50/30 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-orange-100/20 rounded-full blur-[150px] animate-orbital-float" />
                    <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-blue-100/10 rounded-full blur-[120px] animate-orbital-float-reverse" />
                    
                    {/* Left chevron pointer (pointing right) - Blue/Cyan */}
                    <svg
                        className="absolute"
                        style={{ top: '15%', left: '-5%', width: '45%', height: '75%', opacity: 0.8 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s4ChevronGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0022FF" stopOpacity="0.10" />
                                <stop offset="60%" stopColor="#4466FF" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="0,0 280,0 420,325 280,650 0,650"
                            fill="url(#s4ChevronGrad1)"
                        />
                        <polyline
                            points="0,0 280,0 420,325 280,650"
                            fill="none"
                            stroke="rgba(0,34,255,0.12)"
                            strokeWidth="1.2"
                        />
                        <polyline
                            points="0,80 180,80 300,325 180,570"
                            fill="none"
                            stroke="rgba(79,209,232,0.12)"
                            strokeWidth="1"
                            strokeDasharray="6 4"
                        />
                    </svg>

                    {/* Right chevron pointer (pointing left) - Warm Orange/Gold */}
                    <svg
                        className="absolute"
                        style={{ bottom: '10%', right: '-5%', width: '45%', height: '80%', opacity: 0.7 }}
                        viewBox="0 0 450 650"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="s4ChevronGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.08" />
                                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.04" />
                                <stop offset="100%" stopColor="#FFedd5" stopOpacity="0.01" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="450,0 170,0 30,325 170,650 450,650"
                            fill="url(#s4ChevronGrad2)"
                        />
                        <polyline
                            points="450,0 170,0 30,325 170,650"
                            fill="none"
                            stroke="rgba(234,88,12,0.12)"
                            strokeWidth="1.2"
                        />
                        <polyline
                            points="450,80 270,80 130,325 270,570"
                            fill="none"
                            stroke="rgba(245,158,11,0.12)"
                            strokeWidth="1"
                            strokeDasharray="5 3"
                        />
                    </svg>

                    {/* Constellation overlay linking orange/blue zones */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1440 800"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {[
                            [150, 120, 320, 70], [320, 70, 500, 160], [500, 160, 680, 80], [680, 80, 860, 130], [860, 130, 1040, 60], [1040, 60, 1210, 140],
                            [320, 70, 250, 270], [500, 160, 420, 250], [680, 80, 600, 300], [860, 130, 780, 240], [1040, 60, 960, 270],
                            [250, 270, 420, 250], [420, 250, 600, 300], [600, 300, 780, 240], [780, 240, 960, 270]
                        ].map(([x1, y1, x2, y2], i) => (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={i % 2 === 0 ? "rgba(0,34,255,0.04)" : "rgba(234,88,12,0.03)"} strokeWidth="0.8"
                            />
                        ))}
                        {[
                            [150, 120], [320, 70], [500, 160], [680, 80], [860, 130], [1040, 60], [1210, 140],
                            [250, 270], [420, 250], [600, 300], [780, 240], [960, 270]
                        ].map(([cx, cy], i) => (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r={1.8} fill={i % 2 === 0 ? "rgba(0,34,255,0.12)" : "rgba(234,88,12,0.12)"} />
                                <circle cx={cx} cy={cy} r={5} fill={i % 2 === 0 ? "rgba(0,34,255,0.03)" : "rgba(234,88,12,0.03)"} />
                            </g>
                        ))}
                    </svg>

                    {/* Floating double triangle */}
                    <svg className="absolute top-1/4 left-10 w-24 h-24 opacity-[0.06] text-orange-600 animate-float" style={s(500)} viewBox="0 0 100 100">
                        <polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <polygon points="50,30 80,80 20,80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
                    </svg>
                    
                    {/* Big background chevron line */}
                    <svg className="absolute right-0 top-1/2 w-[35%] h-[60%] opacity-[0.03] text-blue-600" viewBox="0 0 100 100" style={{ transform: 'translateY(-50%)' }}>
                        <polygon points="20,0 100,0 100,100 20,100 0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>

                    {/* Dotted grid on the bottom-right side */}
                    <svg className="absolute bottom-16 right-8 w-60 h-30 opacity-[0.10] text-orange-400" viewBox="0 0 200 100">
                        <defs>
                            <pattern id="dotGridS3" width="16" height="16" patternUnits="userSpaceOnUse">
                                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect width="200" height="100" fill="url(#dotGridS3)" />
                    </svg>
                </div>
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-6 sm:space-y-10 animate-fade-in opacity-0" style={s(300)}>
                            <div className="space-y-4">
                                <h2 className="font-bold uppercase tracking-widest text-sm" style={{ color: '#0022FF' }}>Community Impact</h2>
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
                                <img src={panel3} alt="Paid Community Illustration"
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