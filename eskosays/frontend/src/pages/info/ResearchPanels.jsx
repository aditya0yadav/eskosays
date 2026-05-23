import React from 'react';
import { ShieldCheck, Target, BarChart3, Users } from 'lucide-react';

const ResearchPanels = () => {
    const features = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-[#5B6CFF]" />,
            title: "Verified Participants",
            description: "Our multi-layer verification system ensures that researchers only interact with real people, delivering high-fidelity data points."
        },
        {
            icon: <Target className="w-8 h-8 text-[#4FD1E8]" />,
            title: "Precise Targeting",
            description: "Reach your exact demographic within minutes. Our deep profiling allows for hyper-accurate participant selection."
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-[#5B6CFF]" />,
            title: "Real-time Insights",
            description: "Monitor data collection live. Get instant feedback on your research objectives with our integrated dashboard tools."
        },
        {
            icon: <Users className="w-8 h-8 text-[#4FD1E8]" />,
            title: "Diverse Global Pool",
            description: "Access a wide spectrum of voices from different backgrounds, locations, and interests across the globe."
        }
    ];

    return (
        <div className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <h2 className="text-[#5B6CFF] font-bold uppercase tracking-widest text-sm mb-4">Research Excellence</h2>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F1E3A] mb-8 tracking-tight">Our Specialist Research Panels</h1>
                        <p className="text-[#0F1E3A]/70 text-xl leading-relaxed mb-8">
                            At Eskosays, we bridge the gap between global brands and authentic consumer voices. Our proprietary research panels are built on trust, transparency, and high-quality data.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 shadow-md">Partner With Us</button>
                            <button className="px-8 py-4 bg-white border border-gray-200 text-[#0F1E3A] font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95">Our Capabilities</button>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-[#5B6CFF]/30 hover:bg-white transition-all duration-300">
                                <div className="mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-[#0F1E3A] mb-2">{feature.title}</h3>
                                <p className="text-[#0F1E3A]/60 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0F1E3A] rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden text-center lg:text-left shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5B6CFF] pointer-events-none opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 relative z-10 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Unrivaled Data Quality</h2>
                            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                                We've spent years perfecting our participant pool to provide the highest quality market research. Our panels are constantly refreshed and audited to maintain industry-leading status.
                            </p>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <div className="inline-grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold mb-1">99%</div>
                                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Verification</div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold mb-1">5M+</div>
                                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchPanels;
