import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronRight, DollarSign, Check, ArrowRight, MousePointer2, MonitorPlay, ChevronDown, CheckCircle2, MapPin, Sparkles, Square, CheckSquare, Search } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import personaService from '../../services/persona.service';
import { useAuth } from '../../hooks/useAuth';

const CRITICAL_ATTRIBUTES = ['city', 'state', 'job_title', 'income', 'children'];
const QUESTIONS_PER_PAGE = 2;

// --- Custom UI Components ---

const CustomSelect = ({ value, options = [], onChange, placeholder = "Search or select..." }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(!value);

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options.slice(0, 50);
        return options
            .filter(opt => opt?.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 50);
    }, [options, searchQuery]);

    useEffect(() => {
        setIsOpen(!value);
    }, [value]);

    return (
        <div className="space-y-4 pt-2">
            {value && !isOpen ? (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full px-5 py-4 rounded-2xl bg-[#0F1E3A] text-white border-2 border-[#0F1E3A] shadow-md flex items-center justify-between font-sans group cursor-default"
                >
                    <span className="flex-1 text-left text-sm font-bold">{value}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                            setIsOpen(true);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-cyan-400" />
                    </button>
                </motion.div>
            ) : (
                <>
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-sm font-bold placeholder:text-slate-300 transition-all"
                            placeholder={placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = value === opt;
                                return (
                                    <motion.button
                                        key={opt}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onChange(opt);
                                            setSearchQuery('');
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-between ${isSelected
                                            ? 'bg-[#0F1E3A] text-white border-[#0F1E3A] shadow-md'
                                            : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-100 hover:text-slate-900 shadow-sm'
                                            }`}
                                    >
                                        <span className="flex-1 text-left">{opt}</span>
                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                                    </motion.button>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest font-sans">No results found</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const CustomMultiSelect = ({ value = [], options, onChange }) => {
    const [isOpen, setIsOpen] = useState(value.length === 0);

    useEffect(() => {
        if (value.length > 0) setIsOpen(false);
        else setIsOpen(true);
    }, [value.length]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 pt-1 min-h-[50px]">
                {value.map((opt) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-2 rounded-xl bg-[#0F1E3A] text-white flex items-center gap-3 text-xs font-bold border-2 border-[#0F1E3A] shadow-sm"
                    >
                        <span>{opt}</span>
                        <button
                            onClick={() => {
                                const newValue = value.filter(v => v !== opt);
                                onChange(newValue);
                                if (newValue.length === 0) setIsOpen(true);
                            }}
                            className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                    </motion.div>
                ))}

                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:border-indigo-100 hover:text-indigo-600 transition-all text-xs font-bold flex items-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add More
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-100 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-[9px] font-black text-slate-400 uppercase hover:text-slate-600 ml-1"
                            disabled={value.length === 0}
                        >
                            {value.length > 0 ? 'Close List' : ''}
                        </button>
                    </div>
                    {options.map((opt) => {
                        const isSelected = value.includes(opt);
                        return (
                            <motion.button
                                key={opt}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const newValue = isSelected
                                        ? value.filter(v => v !== opt)
                                        : [...value, opt];
                                    onChange(newValue);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2 flex items-center gap-4 ${isSelected
                                    ? 'bg-[#0F1E3A] text-white border-[#0F1E3A] shadow-md'
                                    : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-100 hover:text-slate-900 shadow-sm'
                                    }`}
                            >
                                {isSelected ? <CheckSquare className="w-5 h-5 text-cyan-400" /> : <Square className="w-5 h-5 opacity-20" />}
                                <span className="flex-1 text-left">{opt}</span>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- Main Modal Component ---

const ProfileCompletionModal = ({ onClose }) => {
    const { user } = useAuth();
    const [viewState, setViewState] = useState(() => {
        const saved = localStorage.getItem('profileModalViewState');
        return saved === 'minimized' ? 'minimized' : 'loading';
    });

    const [userProfile, setUserProfile] = useState({});
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = localStorage.getItem('profileModalCurrentPage');
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
        localStorage.setItem('profileModalCurrentPage', currentPage);
    }, [currentPage]);

    // Location Derived State
    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [selectedStateCode, setSelectedStateCode] = useState(null);

    useEffect(() => {
        if (viewState !== 'loading') {
            localStorage.setItem('profileModalViewState', viewState);
        }
    }, [viewState]);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const [qs, profile] = await Promise.all([
                    personaService.getQuestions(),
                    personaService.getProfile()
                ]);

                if (qs.success && profile.success) {
                    const profileData = {};
                    profile.data.forEach(p => {
                        let val = p.value;
                        if (p.definition.type === 'multi-select' && typeof val === 'string') {
                            try { val = JSON.parse(val); } catch (e) { }
                        }
                        profileData[p.definition.key] = val;
                    });

                    setUserProfile(profileData);

                    // Pre-fill location codes if they exist (Check persona OR panelist identity)
                    const currentCountryName = profileData.country || user?.panelist?.country;
                    if (currentCountryName) {
                        const country = Country.getAllCountries().find(c => c.name === currentCountryName);
                        if (country) {
                            setSelectedCountryCode(country.isoCode);
                            const currentStateName = profileData.state;
                            if (currentStateName) {
                                const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === currentStateName);
                                if (state) setSelectedStateCode(state.isoCode);
                            }
                        }
                    }

                    const missing = CRITICAL_ATTRIBUTES.filter(key => {
                        const val = profileData[key];
                        return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
                    });

                    if (missing.length > 0) {
                        setQuestions(qs.data.filter(q => missing.includes(q.key)));

                        setViewState(prev => {
                            const saved = localStorage.getItem('profileModalViewState');
                            if (saved === 'minimized' || saved === 'dismissed') return 'minimized';
                            return 'teaser';
                        });
                    } else {
                        localStorage.removeItem('profileModalViewState');
                        onClose && onClose();
                    }
                } else {
                    onClose && onClose();
                }
            } catch (error) {
                console.error('Error checking profile:', error);
                onClose && onClose();
            }
        };

        checkProfile();
    }, []);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // Handle Location Logic Chain
        if (key === 'country') {
            const country = Country.getAllCountries().find(c => c.name === value);
            if (country) {
                setSelectedCountryCode(country.isoCode);
                setSelectedStateCode(null);
                setFormData(prev => ({ ...prev, state: '', city: '' }));
            }
        } else if (key === 'state') {
            const state = State.getStatesOfCountry(selectedCountryCode).find(s => s.name === value);
            if (state) {
                setSelectedStateCode(state.isoCode);
                setFormData(prev => ({ ...prev, city: '' }));
            }
        }
    };

    const saveCurrentPageData = async () => {
        setSaving(true);
        try {
            const currentKeys = currentQuestions.map(q => q.key);
            const dataToSave = {};
            currentKeys.forEach(key => {
                if (formData[key] !== undefined) {
                    dataToSave[key] = formData[key];
                }
            });

            if (Object.keys(dataToSave).length > 0) {
                await personaService.updateProfile(dataToSave);
            }
        } catch (error) {
            console.error('Failed to save page data:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleNextPage = async () => {
        const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
        await saveCurrentPageData();

        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            onClose && onClose();
        }
    };

    const handleMinimize = async () => {
        if (viewState === 'form') await saveCurrentPageData();
        setViewState('minimized');
    };

    const handleMaximize = () => setViewState('teaser');

    const currentQuestions = questions.slice(
        currentPage * QUESTIONS_PER_PAGE,
        (currentPage + 1) * QUESTIONS_PER_PAGE
    );

    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

    const getOptionsForQuestion = (q) => {
        // Location Library Logic
        if (q.key === 'country') {
            return Country.getAllCountries().map(c => c.name);
        }
        if (q.key === 'state') {
            const cCode = selectedCountryCode;
            if (cCode) {
                return State.getStatesOfCountry(cCode).map(s => s.name);
            }
            return [];
        }
        if (q.key === 'city') {
            const cCode = selectedCountryCode;
            const sCode = selectedStateCode;
            if (cCode && sCode) {
                return City.getCitiesOfState(cCode, sCode).map(c => c.name);
            } else if (cCode) {
                return City.getCitiesOfCountry(cCode).map(c => c.name);
            }
            return [];
        }

        // Default: Strict Database Options
        return q.options || [];
    };

    if (viewState === 'loading') return null;

    return (
        <AnimatePresence>
            {viewState === 'minimized' && (
                <motion.button
                    onClick={handleMaximize}
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 50 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-28 right-6 z-[100] w-14 h-14 bg-[#5B6CFF] rounded-2xl shadow-[0_8px_30px_rgba(91,108,255,0.3)] flex items-center justify-center text-white cursor-pointer border-2 border-white/50"
                >
                    <DollarSign className="w-7 h-7" strokeWidth={2.5} />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF3B30] border-2 border-white"></span>
                    </span>
                </motion.button>
            )}

            {(viewState === 'teaser' || viewState === 'form') && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0F1E3A]/40 backdrop-blur-md"
                        onClick={handleMinimize}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[550px] min-h-[520px] bg-white rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(15,30,58,0.3)] flex flex-col border border-slate-100"
                    >
                        <div className="flex-1 p-10 sm:p-12 text-[#0F1E3A]">
                            {viewState === 'teaser' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative h-full flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <p className="font-sans text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
                                                Profile Enhancement
                                            </p>
                                        </div>
                                        <div className="bg-[#5B6CFF]/10 text-[#5B6CFF] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                            <MousePointer2 className="w-3 h-3 fill-current" />
                                            <span>EARN PREMIUM</span>
                                        </div>
                                    </div>

                                    <h2 className="text-5xl font-display font-black leading-[0.95] tracking-tight text-[#0F1E3A] mb-8">
                                        Unlock high <br />
                                        <span className="text-[#5B6CFF]">paying</span> tasks.
                                    </h2>

                                    <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-[320px]">
                                        Complete your demographic profile to qualify for exclusive, high-value research opportunities.
                                    </p>

                                    <div className="mt-auto space-y-4">
                                        <button
                                            onClick={() => setViewState('form')}
                                            className="w-full py-5 bg-[#0F1E3A] text-white text-lg font-bold rounded-2xl hover:bg-[#1a2f55] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#0F1E3A]/20"
                                        >
                                            Start Earning
                                            <ArrowRight className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleMinimize();
                                                localStorage.setItem('profileModalViewState', 'dismissed');
                                            }}
                                            className="w-full text-[10px] font-black text-slate-400 hover:text-[#0F1E3A] transition-colors py-2 uppercase tracking-[0.2em]"
                                        >
                                            Remind me later
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {viewState === 'form' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                                                <span className="font-sans text-sm font-black text-indigo-600">
                                                    STEP 0{currentPage + 1}
                                                </span>
                                                <div className="h-1 w-8 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-500"
                                                        style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleMinimize} className="p-2 -mr-2 text-slate-300 hover:text-slate-900 transition-all hover:rotate-90">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-8 flex-1 pr-1 overflow-y-auto max-h-[380px] custom-scrollbar pb-4">
                                        {currentQuestions.map((q) => (
                                            <div key={q.key} className="space-y-4 px-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-1">
                                                        {q.title}
                                                    </label>
                                                    {(q.key === 'city' || q.key === 'state') && (userProfile.country || formData.country) && (
                                                        <span className="text-[9px] font-bold text-indigo-500/60 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {userProfile.country || formData.country}
                                                        </span>
                                                    )}
                                                </div>

                                                {q.type === 'single-select' || q.key === 'state' || q.key === 'city' || q.key === 'country' ? (
                                                    <CustomSelect
                                                        value={formData[q.key] || ''}
                                                        options={getOptionsForQuestion(q)}
                                                        onChange={val => handleChange(q.key, val)}
                                                        placeholder={`Select ${q.key}...`}
                                                    />
                                                ) : q.type === 'multi-select' ? (
                                                    <CustomMultiSelect
                                                        value={formData[q.key] || []}
                                                        options={q.options || []}
                                                        onChange={val => handleChange(q.key, val)}
                                                    />
                                                ) : (
                                                    <input
                                                        type={q.type === 'number' ? 'number' : 'text'}
                                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all outline-none text-[#0F1E3A] font-bold placeholder-slate-300 shadow-sm"
                                                        value={formData[q.key] || ''}
                                                        onChange={e => handleChange(q.key, e.target.value)}
                                                        placeholder="Type your answer..."
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={saving}
                                        className="w-full py-5 mt-6 bg-[#0F1E3A] text-white text-lg font-bold rounded-2xl hover:bg-[#1a2f55] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#0F1E3A]/20 disabled:opacity-50"
                                    >
                                        {currentPage === totalPages - 1 ? (saving ? 'Saving...' : 'Complete Profile') : 'Continue'}
                                        <ArrowRight className="w-5 h-5 text-white/50" />
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <div className="bg-[#0F1E3A] p-6 flex items-center gap-5 border-t border-white/5 relative overflow-hidden shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                <MonitorPlay className="w-6 h-6 text-[#4FD1E8]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Live Qualification</h4>
                                <div className="flex gap-2">
                                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden relative">
                                        <motion.div
                                            animate={{ x: [-100, 100] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#4FD1E8] to-transparent"
                                        />
                                    </div>
                                    <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                            <div className="absolute -right-10 top-0 w-32 h-32 bg-[#4FD1E8] rounded-full blur-[60px] opacity-10 pointer-events-none"></div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileCompletionModal;
