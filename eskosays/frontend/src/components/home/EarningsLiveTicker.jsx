import React, { useMemo } from 'react';

// ── Static dataset — 30 real-feeling panelists ───────────────────────────────
const PANELISTS = [
    { name: 'Priya S.', city: 'Mumbai', avatar: '#0022FF' },
    { name: 'Rahul K.', city: 'Delhi', avatar: '#4FD1E8' },
    { name: 'Anita M.', city: 'Bangalore', avatar: '#f59e0b' },
    { name: 'James T.', city: 'London', avatar: '#22c55e' },
    { name: 'Sofia L.', city: 'Mumbai', avatar: '#ec4899' },
    { name: 'Dev P.', city: 'Chennai', avatar: '#8b5cf6' },
    { name: 'Meera R.', city: 'Hyderabad', avatar: '#f97316' },
    { name: 'Carlos G.', city: 'Delhi', avatar: '#06b6d4' },
    { name: 'Sanjay B.', city: 'Pune', avatar: '#10b981' },
    { name: 'Aisha F.', city: 'Kolkata', avatar: '#e11d48' },
    { name: 'Vikram N.', city: 'Jaipur', avatar: '#7c3aed' },
    { name: 'Emma W.', city: 'Bangalore', avatar: '#059669' },
    { name: 'Ravi S.', city: 'Ahmedabad', avatar: '#d97706' },
    { name: 'Pooja D.', city: 'Surat', avatar: '#0891b2' },
    { name: 'Omar K.', city: 'Lucknow', avatar: '#16a34a' },
    { name: 'Neha G.', city: 'Chandigarh', avatar: '#dc2626' },
    { name: 'Arjun M.', city: 'Kochi', avatar: '#9333ea' },
    { name: 'Fatima H.', city: 'Mumbai', avatar: '#db2777' },
    { name: 'Kiran T.', city: 'Bhopal', avatar: '#0284c7' },
    { name: 'Rohit A.', city: 'Nagpur', avatar: '#65a30d' },
    { name: 'Sneha P.', city: 'Indore', avatar: '#ea580c' },
    { name: 'Amit C.', city: 'Vadodara', avatar: '#4f46e5' },
    { name: 'Preethi V.', city: 'Coimbatore', avatar: '#0f766e' },
    { name: 'Aakash J.', city: 'Patna', avatar: '#b45309' },
    { name: 'Divya L.', city: 'Mysore', avatar: '#be185d' },
    { name: 'Suresh N.', city: 'Agra', avatar: '#1d4ed8' },
    { name: 'Lakshmi R.', city: 'Vizag', avatar: '#047857' },
    { name: 'Nikhil S.', city: 'Goa', avatar: '#7e22ce' },
    { name: 'Kavita P.', city: 'Dehradun', avatar: '#c2410c' },
    { name: 'Mohammed A.', city: 'Srinagar', avatar: '#155e75' },
];

const ACTIONS = [
    { text: 'completed a Tech survey', emoji: '💻', minAmt: 1.20, maxAmt: 4.20 },
    { text: 'finished a Finance survey', emoji: '💰', minAmt: 1.80, maxAmt: 5.20 },
    { text: 'completed a Health survey', emoji: '❤️', minAmt: 0.90, maxAmt: 3.10 },
    { text: 'finished 3 quick polls', emoji: '✅', minAmt: 0.75, maxAmt: 2.40 },
    { text: 'completed a Lifestyle survey', emoji: '✨', minAmt: 0.80, maxAmt: 2.85 },
    { text: 'just cashed out their balance', emoji: '🎉', minAmt: 10.00, maxAmt: 25.00 },
    { text: 'completed a Food survey', emoji: '🍽️', minAmt: 0.70, maxAmt: 2.20 },
    { text: 'finished an Entertainment poll', emoji: '🎬', minAmt: 0.60, maxAmt: 2.00 },
];

const TIMES = ['just now', '1 min ago', '2 min ago', '4 min ago', '6 min ago', '9 min ago', '12 min ago'];

// Seeded pseudo-random so values stay stable across renders
function seededRand(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

function buildEntries() {
    return PANELISTS.map((p, i) => {
        const action = ACTIONS[Math.floor(seededRand(i * 3) * ACTIONS.length)];
        const amt = (
            action.minAmt + seededRand(i * 7) * (action.maxAmt - action.minAmt)
        ).toFixed(2);
        const time = TIMES[Math.floor(seededRand(i * 13) * TIMES.length)];
        return { ...p, action, amt, time, id: i };
    });
}

// ── Component ─────────────────────────────────────────────────────────────────
const EarningsLiveTicker = () => {
    const entries = useMemo(() => buildEntries(), []);
    // Double the list multiple times to guarantee wide seamless scroll width
    const doubled = [...entries, ...entries, ...entries, ...entries];

    return (
        <section className="w-full bg-[#0F1E3A] py-12 sm:py-16 relative overflow-hidden">
            {/* Geometric Shapes & Constellation in Price Ticker (Dark Theme) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Ambient glow blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0022FF]/12 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4FD1E8]/10 rounded-full blur-[100px]" />
                
                {/* Left chevron pointer (pointing right) */}
                <svg
                    className="absolute opacity-40"
                    style={{ top: '-10%', left: '-8%', width: '40%', height: '120%' }}
                    viewBox="0 0 450 650"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="tickerChevron1" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0022FF" stopOpacity="0.25" />
                            <stop offset="60%" stopColor="#4466FF" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <polygon
                        points="0,0 260,0 390,325 260,650 0,650"
                        fill="url(#tickerChevron1)"
                    />
                    <polyline
                        points="0,0 260,0 390,325 260,650"
                        fill="none"
                        stroke="rgba(79,209,232,0.25)"
                        strokeWidth="1.5"
                    />
                </svg>

                {/* Right chevron pointer (pointing left) */}
                <svg
                    className="absolute opacity-40"
                    style={{ top: '-10%', right: '-8%', width: '40%', height: '120%' }}
                    viewBox="0 0 450 650"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="tickerChevron2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0022FF" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#4FD1E8" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <polygon
                        points="450,0 190,0 60,325 190,650 450,650"
                        fill="url(#tickerChevron2)"
                    />
                    <polyline
                        points="450,0 190,0 60,325 190,650"
                        fill="none"
                        stroke="rgba(0,34,255,0.30)"
                        strokeWidth="1.5"
                    />
                </svg>

                {/* Constellation lines */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {[
                        [100, 50, 250, 120], [250, 120, 420, 40], [420, 40, 600, 100], [600, 100, 780, 50], [780, 50, 950, 140], [950, 140, 1120, 60], [1120, 60, 1300, 110],
                        [250, 120, 180, 240], [420, 40, 360, 210], [600, 100, 520, 250], [780, 50, 700, 200], [950, 140, 880, 230], [1120, 60, 1040, 210], [1300, 110, 1220, 250],
                        [180, 240, 360, 210], [360, 210, 520, 250], [520, 250, 700, 200], [700, 200, 880, 230], [880, 230, 1040, 210], [1040, 210, 1220, 250]
                    ].map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="rgba(79,209,232,0.12)" strokeWidth="0.8"
                        />
                    ))}
                    {[
                        [100, 50], [250, 120], [420, 40], [600, 100], [780, 50], [950, 140], [1120, 60], [1300, 110],
                        [180, 240], [360, 210], [520, 250], [700, 200], [880, 230], [1040, 210], [1220, 250]
                    ].map(([cx, cy], i) => (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r={2} fill="rgba(79,209,232,0.3)" />
                            <circle cx={cx} cy={cy} r={6} fill="rgba(79,209,232,0.06)" />
                        </g>
                    ))}
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-[5%] relative z-10">

                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            {/* Pulsing live dot */}
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                            </span>
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest font-mono">Live Activity Stream</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Real <span className="text-emerald-400">payouts</span>, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0022FF, #4FD1E8)' }}>real people</span> — right now
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
                        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">Total paid out</span>
                        <span className="text-white font-black text-base">$14,320+</span>
                    </div>
                </div>
            </div>

            {/* Horizontal Ticker Lane Container */}
            <div className="relative w-full overflow-hidden py-2 flex flex-col gap-5">
                {/* Horizontal Fade Masks */}
                <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#0F1E3A] via-[#0F1E3A]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#0F1E3A] via-[#0F1E3A]/80 to-transparent z-10 pointer-events-none" />

                {/* Lane 1: Scrolls Left */}
                <div className="flex overflow-hidden w-full select-none">
                    <div className="animate-marquee-left">
                        {doubled.filter((_, i) => i % 2 === 0).map((e, i) => (
                            <TickerCard key={`a-${i}`} entry={e} />
                        ))}
                    </div>
                </div>

                {/* Lane 2: Scrolls Right */}
                <div className="flex overflow-hidden w-full select-none">
                    <div className="animate-marquee-right">
                        {doubled.filter((_, i) => i % 2 === 1).map((e, i) => (
                            <TickerCard key={`b-${i}`} entry={e} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TickerCard = ({ entry }) => {
    const initials = entry.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    return (
        <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-full pl-3 pr-5 py-2.5 transition-all duration-300 group flex-shrink-0 mx-2 cursor-pointer">
            {/* Avatar with status dot */}
            <div className="relative flex-shrink-0">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md"
                    style={{ background: entry.avatar }}
                >
                    {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F1E3A] animate-pulse" />
            </div>

            {/* Text details */}
            <div className="min-w-0">
                <p className="text-white/90 text-xs font-bold leading-none flex items-center gap-1.5">
                    <span>{entry.name}</span>
                    <span className="text-white/40 font-normal">({entry.city})</span>
                </p>
                <p className="text-white/40 text-[10px] leading-none mt-1.5 truncate">
                    {entry.action.emoji}&nbsp;{entry.action.text}
                </p>
            </div>

            {/* Payout badge details */}
            <div className="border-l border-white/10 pl-3 ml-1 flex flex-col items-end flex-shrink-0">
                <span className="text-emerald-400 font-extrabold text-xs leading-none">+${entry.amt}</span>
                <span className="text-white/20 text-[8px] font-bold mt-1 uppercase tracking-wider font-mono">{entry.time}</span>
            </div>
        </div>
    );
};

export default EarningsLiveTicker;
