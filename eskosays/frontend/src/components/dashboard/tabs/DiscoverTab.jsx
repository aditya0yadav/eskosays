import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Sparkles, ArrowRight, Loader2, Inbox } from 'lucide-react';
import surveyService from '../../../services/survey.service';

const DiscoverTab = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSurveys = async () => {
            setLoading(true);
            try {
                const data = await surveyService.getSurveys();
                // Sort by highest payout and slice top 10
                const topSurveys = data
                    .sort((a, b) => b.payout - a.payout)
                    .slice(0, 10);
                setSurveys(topSurveys);
            } catch (error) {
                console.error('Failed to fetch surveys:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    const getProviderStyle = (provider) => {
        const p = provider?.toLowerCase();
        if (p === 'goweb') return 'bg-orange-50 text-orange-600 border-orange-100';
        if (p === 'zamplia') return 'bg-purple-50 text-purple-600 border-purple-100';
        return 'bg-cyan-50 text-cyan-600 border-cyan-100';
    };

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-4xl font-sans font-[300] tracking-tight text-slate-900">Discover <span className="text-cyan-600 font-[400]">Insights</span></h1>
                <p className="text-slate-400 font-[400]">Explore new research opportunities and missions.</p>
            </div>

            <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                <input
                    type="text"
                    placeholder="Search surveys by topic or keyword..."
                    className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/30 transition-all placeholder:text-slate-300 shadow-sm shadow-cyan-500/5"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                    <p className="text-slate-400 font-[400]">Finding fresh research opportunities...</p>
                </div>
            ) : surveys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveys.map((survey, idx) => (
                        <motion.div
                            key={survey.providerSurveyId || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                {/* <span className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${getProviderStyle(survey.provider)}`}>
                                    {survey.provider === 'goweb' ? 'GoWeb' : survey.provider.charAt(0).toUpperCase() + survey.provider.slice(1)}
                                </span> */}
                            </div>
                            <h3 className="text-lg font-sans font-[400] text-slate-900 mb-2 line-clamp-2 h-14">{survey.title}</h3>
                            <div className="flex items-center justify-between text-slate-400 text-sm mb-6">
                                <span>{survey.duration || 'Flexible'}</span>
                                <span className="font-bold text-slate-900 font-mono">
                                    {typeof survey.payout === 'number' ? `$${survey.payout.toFixed(2)}` : `$${survey.payout}`}
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        const result = await surveyService.initiateSurvey(survey.provider, survey.providerSurveyId);
                                        if (result?.entryLink) {
                                            window.open(result.entryLink, '_blank', 'noopener,noreferrer');
                                        }
                                    } catch (err) {
                                        alert('Unable to start survey at this time. Please try again later.');
                                    }
                                }}
                                className="w-full py-3 rounded-xl bg-slate-50 text-cyan-600 font-bold group-hover:bg-cyan-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                Start Survey <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="p-4 rounded-full bg-white shadow-sm">
                        <Inbox className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-[500] text-slate-900">No missions found at the moment</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            {import.meta.env.MODE === 'development'
                                ? "Development gating is active. In production, this section will pull from goweb, zamplia, and more."
                                : "Check back soon for new research opportunities tailored to your profile."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoverTab;
