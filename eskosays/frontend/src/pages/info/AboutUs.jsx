import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Globe, ArrowRight, Quote } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans canvas-gradient">

            {/* ── Editorial Hero ───────────────────────────────────────────── */}
            <section className="relative px-4 sm:px-[5%] pt-28 pb-20 lg:pt-36 lg:pb-28" style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,34,255,0.08)' }}>
                <div className="max-w-[1000px] mx-auto relative z-10">

                    {/* Minimal Eyebrow */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-10 sm:w-16" style={{ background: '#0022FF' }} />
                        <span className="font-bold text-xs uppercase tracking-[0.2em] font-mono" style={{ color: '#0022FF' }}>
                            Who We Are
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-[5rem] font-bold text-[#0F1E3A] leading-[1.05] tracking-tight mb-8">
                        The emerging world of <br className="hidden sm:block" />
                        <span className="relative">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0F1E3A] to-[#3a4f82]">
                                Market Research.
                            </span>
                            <div className="absolute bottom-1 sm:bottom-2 left-0 w-full h-3 sm:h-5 bg-[#4FD1E8]/20 -z-0 transform -rotate-1 rounded-sm" />
                        </span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 pl-4 sm:pl-8 border-l-2 border-slate-100">
                        <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                            Find out why you should select us from the best online survey sites in India and the US.
                            <strong className="font-semibold text-[#0F1E3A]"> Your views matter to the world.</strong>
                        </p>
                    </div>

                </div>
            </section>

            {/* ── Asymmetrical Body Content ─────────────────────────────────── */}
            <section className="px-4 sm:px-[5%] py-20 lg:py-32 max-w-[1200px] mx-auto w-full">

                {/* 1. The Business Side */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-32 items-start">

                    {/* Left Typography Block */}
                    <div className="flex-1 lg:max-w-[45%] lg:sticky lg:top-32">
                        <h2 className="text-3xl sm:text-5xl font-black text-[#0F1E3A] leading-[1.1] mb-6 tracking-tight">
                            Grow your business. <br />
                            <span className="text-slate-400">Stand out.</span>
                        </h2>
                        <div className="w-12 h-1 mb-8 rounded-full" style={{ background: '#0022FF' }} />
                        <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                            Market research is the systematic gathering, recording, and analyzing of data and problems associated with products and services.
                        </p>
                        <p className="text-base text-slate-500 leading-relaxed">
                            When a business identifies a problem and its deemed solution, researchers create objectives and collect feedback from users like you. Survey results help predict market response and shape the proposed solution.
                        </p>
                    </div>

                    {/* Right Context Block (Offset) */}
                    <div className="flex-1 mt-0 lg:mt-24 space-y-12">
                        {/* Clean minimal card */}
                        <div className="bg-white p-8 sm:p-10 rounded-[1.5rem] border group hover:-translate-y-1 transition-transform duration-500 depth-card">
                                <Target className="w-8 h-8 mb-6 opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: '#0022FF' }} />
                            <p className="text-lg text-[#0F1E3A] leading-relaxed font-medium">
                                Brands roll out surveys on the best paid survey sites. When you fill these questionnaires, your responses help the brands to refine their products—old and new.
                            </p>
                        </div>

                        {/* Pull quote style */}
                        <div className="pl-6 border-l-4 border-emerald-400 relative">
                            <Quote className="absolute -left-3 -top-3 w-8 h-8 text-emerald-100 fill-emerald-50" />
                            <p className="text-xl sm:text-2xl font-bold text-[#0F1E3A] leading-snug tracking-tight">
                                Your opinions enable the brands to understand the desires of the target market better. Your valuable inputs define the <span className="text-emerald-500">success or failure</span> of products and services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. The Bridge Side */}
                <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-start pt-16 border-t border-slate-200/60">

                    {/* Right (now left visually) Typography Block */}
                    <div className="flex-1 lg:max-w-[45%]">
                        <h2 className="text-3xl sm:text-5xl font-black text-[#0F1E3A] leading-[1.1] mb-6 tracking-tight">
                            The role we play <br />
                            <span className="text-emerald-500">between you and them.</span>
                        </h2>
                        <div className="w-12 h-1 bg-emerald-400 mb-8 rounded-full" />
                        <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                            Eskosays collects inputs via online mail surveys and questionnaires from qualified individuals addressed to specific demographics.
                        </p>
                        <p className="text-base text-slate-500 leading-relaxed">
                            We collate your thoughts on behalf of the market research companies and brands. Market research companies partner with us, and we reward you for your precious time and input.
                        </p>
                    </div>

                    {/* Left (now right visually) Context Block */}
                    <div className="flex-1 space-y-8 mt-0 lg:mt-16">
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-[0.1em] mb-8">
                            A Global Connect
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {['India', 'USA', 'Canada', 'Europe', 'Australia', 'Germany'].map(country => (
                                <div key={country} className="flex items-center gap-3 py-3 border-b border-slate-100">
                                    <Globe className="w-4 h-4 text-[#4FD1E8]" />
                                    <span className="font-semibold text-[#0F1E3A]">{country}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 sm:p-10 rounded-[1.5rem] text-white"
                            style={{ background: 'linear-gradient(135deg, #0022FF 0%, #0F1E3A 100%)' }}>
                            <p className="text-xl font-medium leading-relaxed">
                                Fill from anywhere, anytime, and make bucks. We connect your opinions with brands globally.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── Architectural CTA ────────────────────────────────────────── */}
            <section className="mt-auto border-t border-slate-800"
                style={{ background: 'linear-gradient(135deg, #0022FF 0%, #0F1E3A 100%)' }}>
                <div className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-24 lg:py-32 flex flex-col md:flex-row items-center justify-between gap-12">

                    <div className="max-w-xl">
                        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                            Share your Opinions
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-400 font-medium">
                            Register with Eskosays today, and let your opinion do the talking.
                        </p>
                    </div>

                    <Link
                        to="/signup"
                        className="group relative inline-flex items-center justify-center gap-4 bg-white text-[#0022FF] px-8 py-5 sm:px-10 sm:py-6 rounded-full text-lg sm:text-xl font-black shadow-2xl hover:bg-slate-50 transition-all duration-300 flex-shrink-0 no-underline"
                    >
                        <span>Register Now</span>
                        <ArrowRight strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                </div>
            </section>
        </div>
    );
};

export default AboutUs;
