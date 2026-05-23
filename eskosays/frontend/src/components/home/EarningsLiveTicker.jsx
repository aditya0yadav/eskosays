import React, { useMemo } from 'react';

// ── Static dataset — 30 real-feeling panelists ───────────────────────────────
const PANELISTS = [
    { name: 'Priya S.', city: 'Mumbai', avatar: '#5B6CFF' },
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
    // Double the list for a seamless loop
    const doubled = [...entries, ...entries];

    return (
        <section className="w-full bg-[#0F1E3A] py-10 sm:py-14 relative overflow-hidden">
            {/* Subtle bg glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5B6CFF]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4FD1E8]/8 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-[5%] relative z-10">

                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            {/* Pulsing live dot */}
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                            </span>
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Live Activity</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Real <span className="text-emerald-400">payouts</span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8]">real people</span> — right now
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                        <span className="text-white/40 text-xs font-semibold">Total paid out</span>
                        <span className="text-white font-black text-sm">$14,320+</span>
                    </div>
                </div>

                {/* Ticker grid — 2 columns on desktop, 1 on mobile */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">

                    {/* Column 1 — scrolls up */}
                    <div className="h-[280px] sm:h-[320px] overflow-hidden relative">
                        {/* Fade masks */}
                        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0F1E3A] to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0F1E3A] to-transparent z-10 pointer-events-none" />

                        <div className="animate-ticker-scroll-a flex flex-col gap-3">
                            {doubled.slice(0, doubled.length / 2 * 2).filter((_, i) => i % 2 === 0).map((e, i) => (
                                <TickerCard key={`a-${i}`} entry={e} />
                            ))}
                        </div>
                    </div>

                    {/* Column 2 — scrolls up, offset start */}
                    <div className="h-[280px] sm:h-[320px] overflow-hidden relative hidden sm:block">
                        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0F1E3A] to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0F1E3A] to-transparent z-10 pointer-events-none" />

                        <div className="animate-ticker-scroll-b flex flex-col gap-3">
                            {doubled.slice(0, doubled.length / 2 * 2).filter((_, i) => i % 2 === 1).map((e, i) => (
                                <TickerCard key={`b-${i}`} entry={e} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

const TickerCard = ({ entry }) => {
    const initials = entry.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    return (
        <div className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-4 py-3 transition-colors duration-200 group flex-shrink-0">
            {/* Avatar */}
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md"
                style={{ background: entry.avatar }}
            >
                {initials}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-semibold leading-tight truncate">
                    <span className="text-white">{entry.name}</span>
                    <span className="text-white/40 font-normal"> · {entry.city}</span>
                </p>
                <p className="text-white/50 text-xs leading-tight mt-0.5 truncate">
                    {entry.action.emoji}&nbsp;{entry.action.text}
                </p>
            </div>

            {/* Amount + time badge */}
            <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-emerald-400 font-black text-sm">+${entry.amt}</span>
                <span className="text-white/25 text-[10px] font-medium mt-0.5">{entry.time}</span>
            </div>
        </div>
    );
};

export default EarningsLiveTicker;
