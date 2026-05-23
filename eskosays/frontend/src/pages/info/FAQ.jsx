import React, { useState } from 'react';
import { ChevronDown, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            question: "How do I start earning rewards on Eskosays?",
            answer: "Simply create a free account, complete your profile to 100%, and match with surveys. Once you complete a survey successfully, the rewards will be credited to your account balance. Your first paid survey could be waiting for you right now."
        },
        {
            question: "Is Eskosays really free to join?",
            answer: "Yes, 100%. We will never ask for payment, subscription fees, or hidden charges. Our platform is entirely supported by the market research companies who need to hear your voice to shape their future products."
        },
        {
            question: "What is the minimum payout threshold?",
            answer: "The minimum payout threshold depends on the withdrawal method you choose. Typically, it ranges from $5.00 to $10.00. You can check the current thresholds at any time in your Rewards dashboard."
        },
        {
            question: "Why was my survey disqualified?",
            answer: "Researchers often look for a very specific demographic to ensure data accuracy. If your responses indicate you don't neatly fit that required criteria, the survey may end early. We try our best to pre-match you, but early disqualifications happen."
        },
        {
            question: "How long does it take to receive my payment?",
            answer: "We value your time and aim for speed. Most payouts are processed internally within 24-48 business hours. However, depending on the method (like direct bank transfers), it may take an additional 3-5 business days for funds to reflect."
        },
        {
            question: "Can I use Eskosays on my mobile device?",
            answer: "Absolutely. the Eskosays platform is fully optimized for mobile browsers so you can take surveys on the go—whether you're commuting, waiting in line, or relaxing at home."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">

            {/* ── Editorial Header & Layout ─────────────────────────────────── */}
            <section className="px-4 sm:px-[5%] pt-28 pb-32 lg:pt-36 max-w-[1200px] mx-auto w-full flex flex-col lg:flex-row gap-16 lg:gap-24">

                {/* Left: Sticky Context Column */}
                <div className="flex-1 lg:max-w-[40%] lg:sticky lg:top-36 self-start">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-10 sm:w-16 bg-emerald-400" />
                        <span className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] font-mono">
                            Support Center
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-[#0F1E3A] leading-[1.05] tracking-tight mb-8">
                        Frequently <br />
                        <span className="text-slate-400">Asked Questions.</span>
                    </h1>

                    <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 pl-4 border-l-2 border-slate-100">
                        Everything you need to know about getting the most out of Eskosays, matching with surveys, and redeeming your hard-earned rewards.
                    </p>

                    {/* Search Input */}
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-6 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 text-slate-700 font-medium transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                </div>

                {/* Right: Accordion Column */}
                <div className="flex-1 mt-0 lg:mt-8">
                    {filteredFaqs.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            No answers found for "{searchQuery}". Try a different term.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {filteredFaqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div key={index} className="group py-6">
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                            className="w-full flex justify-between items-start gap-6 text-left"
                                        >
                                            <h3 className={`text-xl font-bold leading-tight transition-colors ${isOpen ? 'text-emerald-500' : 'text-[#0F1E3A] group-hover:text-emerald-500'
                                                }`}>
                                                {faq.question}
                                            </h3>
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-emerald-200 transition-colors mt-0.5">
                                                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                                            </div>
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-lg text-slate-600 leading-relaxed pr-8 border-l-2 border-emerald-100 pl-6">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Support Fallback */}
                    <div className="mt-16 bg-slate-50 p-8 sm:p-10 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="text-xl font-bold text-[#0F1E3A] mb-2">Still have questions?</h4>
                            <p className="text-slate-500 font-medium">Reach out directly to our support team.</p>
                        </div>
                        <a
                            href="mailto:support@eskosays.com"
                            className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-[#0F1E3A] font-bold hover:border-[#0F1E3A] transition-colors shadow-sm"
                        >
                            email Support
                        </a>
                    </div>
                </div>

            </section>

            {/* ── Architectural CTA (Consistent with AboutUs) ──────────────── */}
            <section className="mt-auto bg-slate-900 border-t border-slate-800">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-24 lg:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                            Ready to participate?
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-400 font-medium">
                            Join thousand of panelists and start earning today.
                        </p>
                    </div>
                    <Link
                        to="/signup"
                        className="group relative inline-flex items-center justify-center gap-4 bg-emerald-500 text-white px-8 py-5 sm:px-10 sm:py-6 rounded-full text-lg sm:text-xl font-black shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all duration-300 flex-shrink-0"
                    >
                        <span>Create your account</span>
                        <ArrowRight strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
