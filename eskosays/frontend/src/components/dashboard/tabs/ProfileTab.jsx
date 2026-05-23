import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    User, Mail, MapPin, Globe, Camera, Save, Loader2,
    Settings, Grid, Lock, Activity, ChevronRight, Edit3,
    FileText, CheckCircle2, AlertCircle, Sparkles, ChevronDown, Check, Square, CheckSquare, Search, LogOut,
    X, Plus, KeyRound, SendHorizonal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, State, City } from 'country-state-city';
import { useAuth } from '../../../hooks/useAuth';
import api, { getAssetUrl } from '../../../services/api';
import userService from '../../../services/user.service';
import personaService from '../../../services/persona.service';
import { toast } from 'react-hot-toast';
import { auth } from '../../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

// --- Reusable Premium Components ---

const CustomSelect = ({ value, options = [], onChange, placeholder = "Search or select...", label }) => {
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
            {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}

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
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-sm font-bold placeholder:text-slate-300 transition-all font-sans"
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
                                        className={`w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-between font-sans ${isSelected
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

const CustomMultiSelect = ({ value = [], options, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(value.length === 0);

    useEffect(() => {
        if (value.length > 0) setIsOpen(false);
        else setIsOpen(true);
    }, [value.length]);

    return (
        <div className="space-y-3">
            {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}

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

// --- Main Component ---

const ProfileTab = () => {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState(() => localStorage.getItem('profileActiveSubTab') || 'info');
    const fileInputRef = useRef(null);

    // Password reset state
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handlePasswordReset = async () => {
        const email = user?.email;
        if (!email) return;
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            toast.success(`Password reset link sent to ${email}`);
        } catch (err) {
            console.error('Password reset error:', err);
            toast.error('Failed to send reset email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('profileActiveSubTab', activeSubTab);
    }, [activeSubTab]);

    const [stats, setStats] = useState({
        completions: 0,
        earnings: 0,
        quality_score: 98
    });

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        city: '',
        zip_code: '',
        bio: '',
        timezone: '',
        country: ''
    });

    const [personaQuestions, setPersonaQuestions] = useState([]);
    const [personaData, setPersonaData] = useState({});

    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [selectedStateCode, setSelectedStateCode] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [statsRes, qRes, pRes] = await Promise.all([
                    userService.getHomeStats(),
                    personaService.getQuestions(),
                    personaService.getProfile()
                ]);

                if (statsRes.success) {
                    setStats({
                        completions: statsRes.data.completions_count,
                        earnings: statsRes.data.lifetime_earnings,
                        quality_score: statsRes.data.quality_score
                    });
                }

                if (qRes.success) setPersonaQuestions(qRes.data);

                if (pRes.success) {
                    const profileData = {};
                    pRes.data.forEach(p => {
                        let val = p.value;
                        if (p.definition?.type === 'multi-select' && typeof val === 'string') {
                            try { val = JSON.parse(val); } catch (e) { }
                        }
                        profileData[p.definition?.key] = val;
                    });
                    setPersonaData(profileData);

                    // ── Merge persona location into formData ───────────────────
                    // Persona data is more authoritative for location (set during onboarding)
                    setFormData(prev => ({
                        ...prev,
                        country: profileData.country || prev.country,
                        city: profileData.city || prev.city,
                    }));

                    // Pre-fill ISO codes for dropdowns
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
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            setFormData({
                first_name: user.panelist?.first_name || '',
                last_name: user.panelist?.last_name || '',
                email: user.email || '',
                username: user.username || '',
                phone: user.panelist?.phone || '',
                city: user.panelist?.city || '',
                country: user.panelist?.country || '',
                zip_code: user.panelist?.zip_code || '',
                bio: user.panelist?.bio || '',
                timezone: user.panelist?.timezone || ''
            });
            fetchAllData();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setPersonaData(prev => ({ ...prev, [name]: value }));

        if (name === 'country') {
            const country = Country.getAllCountries().find(c => c.name === value);
            if (country) {
                setSelectedCountryCode(country.isoCode);
                setSelectedStateCode(null);
                setPersonaData(prev => ({ ...prev, state: '', city: '' }));
            }
        }
    };

    const handlePersonaChange = (key, value) => {
        setPersonaData(prev => ({ ...prev, [key]: value }));

        if (key === 'country') {
            const country = Country.getAllCountries().find(c => c.name === value);
            if (country) {
                setSelectedCountryCode(country.isoCode);
                setSelectedStateCode(null);
                setPersonaData(prev => ({ ...prev, state: '', city: '' }));
                setFormData(prev => ({ ...prev, country: value, city: '' }));
            }
        } else if (key === 'state') {
            const state = State.getStatesOfCountry(selectedCountryCode).find(s => s.name === value);
            if (state) {
                setSelectedStateCode(state.isoCode);
                setPersonaData(prev => ({ ...prev, city: '' }));
                setFormData(prev => ({ ...prev, city: '' }));
            }
        } else if (key === 'city') {
            setFormData(prev => ({ ...prev, city: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Save panelist profile
            await userService.updateProfile(formData);

            // 2. Sync shared location fields back to persona data so both tabs stay in sync
            const locationSync = {};
            if (formData.country) locationSync.country = formData.country;
            if (formData.city) locationSync.city = formData.city;
            if (Object.keys(locationSync).length > 0) {
                const mergedPersona = { ...personaData, ...locationSync };
                setPersonaData(mergedPersona);
                await personaService.updateProfile(mergedPersona);
            }

            await refreshUser();
            toast.success('Identity updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update identity');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePersona = async () => {
        setSaving(true);
        try {
            // 1. Save persona data
            await personaService.updateProfile(personaData);

            // 2. Sync shared location fields back to panelist profile so Identity tab stays in sync
            const locationUpdate = {
                ...formData,
                country: personaData.country || formData.country,
                city: personaData.city || formData.city,
            };
            if (personaData.country || personaData.city) {
                await userService.updateProfile(locationUpdate);
                setFormData(locationUpdate);
                await refreshUser();
            }

            toast.success('Profiling saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save profiling');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploading(true);
            await userService.updateAvatar(file);
            await refreshUser();
            toast.success("Avatar updated");
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            toast.error("Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const getAvatarUrl = () => {
        const url = getAssetUrl(user?.avatar_url);
        if (url) console.log('DEBUG: ProfileTab Avatar URL:', url);
        return url;
    };

    const completionPercentage = () => {
        if (!personaQuestions.length) return 0;
        const filled = personaQuestions.filter(q => {
            const val = personaData[q.key];
            return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
        }).length;
        return Math.round((filled / personaQuestions.length) * 100);
    };

    const getOptionsForQuestion = (q) => {
        if (q.key === 'country') return Country.getAllCountries().map(c => c.name);
        if (q.key === 'state') {
            if (selectedCountryCode) return State.getStatesOfCountry(selectedCountryCode).map(s => s.name);
            return [];
        }
        if (q.key === 'city') {
            if (selectedCountryCode && selectedStateCode) return City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => c.name);
            if (selectedCountryCode) return City.getCitiesOfCountry(selectedCountryCode).map(c => c.name);
            return [];
        }
        return q.options || [];
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:px-8">
            <div className="mb-12">
                <div className="flex flex-col md:flex-row items-center md:items-start md:gap-16">
                    <div className="relative group mb-8 md:mb-0">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden">
                            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-slate-50 relative">
                                {getAvatarUrl() ? <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-display font-medium text-4xl">{user?.email?.[0]?.toUpperCase()}</div>}
                                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                            </div>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-3 bg-white text-indigo-600 rounded-2xl shadow-xl hover:bg-indigo-50 border border-slate-100"><Camera className="w-5 h-5" /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{user?.username || 'Member'}</h1>
                            <div className="flex items-center gap-2">
                                <span className="p-1 px-3 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">Level {Math.floor(stats.completions / 10) + 1}</span>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate('/');
                                    }}
                                    className="lg:hidden flex items-center gap-2 p-1.5 px-3 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100/30 active:scale-95 transition-all ml-auto md:ml-0"
                                >
                                    <LogOut className="w-3 h-3" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/50"><span className="text-xl font-bold font-display text-slate-900">{stats.completions}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</span></div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/50"><span className="text-xl font-bold font-display text-slate-900">${stats.earnings.toFixed(2)}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earned</span></div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/5 rounded-2xl border border-indigo-600/10"><span className="text-xl font-bold font-display text-indigo-600">{Math.round(stats.quality_score)}%</span><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Trust</span></div>
                        </div>
                        <div className="space-y-3 max-w-xl">
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{formData.bio || 'Add a brief overview of your professional background.'}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><MapPin className="w-3 h-3" /> {formData.city || 'Location not set'}</div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Globe className="w-3 h-3" /> {formData.timezone || 'UTC'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar pb-1">
                <PremiumTabLink icon={<Grid />} label="Identity" active={activeSubTab === 'info'} onClick={() => setActiveSubTab('info')} />
                <PremiumTabLink icon={<FileText />} label="Profiling" active={activeSubTab === 'profiling'} onClick={() => setActiveSubTab('profiling')} badge={completionPercentage() < 100 ? `${100 - completionPercentage()}% to go` : null} />
                <PremiumTabLink icon={<Lock />} label="Security" active={activeSubTab === 'security'} onClick={() => setActiveSubTab('security')} />
                <PremiumTabLink icon={<Activity />} label="Activity" active={activeSubTab === 'activity'} onClick={() => setActiveSubTab('activity')} />
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeSubTab === 'info' && (
                        <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                                <InputField label="email address" name="email" value={formData.email} disabled icon={<Mail />} />
                                <InputField label="Postal Code" name="zip_code" value={formData.zip_code} onChange={handleChange} />
                                <CustomSelect label="Country" value={formData.country} options={Country.getAllCountries().map(c => c.name)} onChange={val => handleLocationChange('country', val)} />
                                <CustomSelect label="City / Region" value={formData.city} options={selectedCountryCode ? City.getCitiesOfCountry(selectedCountryCode).map(c => c.name) : []} onChange={val => handleLocationChange('city', val)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-sans">Professional Overview</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all resize-none text-slate-800 text-sm font-medium" placeholder="Describe your expertise..." />
                            </div>
                            <div className="flex justify-end pt-4"><button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-display font-bold shadow-xl shadow-indigo-600/20 disabled:opacity-70 flex items-center gap-3">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profile</button></div>
                        </motion.div>
                    )}

                    {activeSubTab === 'profiling' && (
                        <motion.div key="profiling" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                            <div className="p-8 bg-gradient-to-br from-[#0F1E3A] to-[#1e2d4d] rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex items-center gap-8 text-white">
                                    <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border border-white/20"><span className="text-3xl font-black font-display">{completionPercentage()}%</span><span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Complete</span></div>
                                    <div className="flex-1"><h3 className="text-xl font-display font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-400" /> Targeted Profiling</h3><p className="text-sm text-white/60">Complete your profile to receive premium research tasks.</p></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {personaQuestions.map((q) => (
                                    <div key={q.key} className="space-y-3">
                                        {q.type === 'single-select' || q.key === 'state' || q.key === 'city' || q.key === 'country' ? (
                                            <CustomSelect label={q.title} value={personaData[q.key] || ''} options={getOptionsForQuestion(q)} onChange={val => handlePersonaChange(q.key, val)} />
                                        ) : q.type === 'multi-select' ? (
                                            <CustomMultiSelect label={q.title} value={personaData[q.key] || []} options={q.options || []} onChange={val => handlePersonaChange(q.key, val)} />
                                        ) : (
                                            <InputField
                                                label={q.title}
                                                value={personaData[q.key] || ''}
                                                onChange={e => handlePersonaChange(q.key, e.target.value)}
                                                type={q.type === 'number' ? 'number' : 'text'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4"><button onClick={handleSavePersona} disabled={saving} className="px-10 py-4 bg-[#0F1E3A] text-white rounded-[2rem] font-display font-bold shadow-xl shadow-[#0F1E3A]/20 disabled:opacity-70 flex items-center gap-3">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profiling Data</button></div>
                        </motion.div>
                    )}

                    {activeSubTab === 'security' && (
                        <motion.div key="security" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                            <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shrink-0">
                                        <KeyRound className="w-7 h-7 text-indigo-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-bold text-slate-900 mb-1">Password Reset</h4>
                                        <p className="text-sm text-slate-400 font-medium mb-5">
                                            We'll send a secure reset link to <span className="text-slate-700 font-bold">{user?.email}</span>.
                                            The link expires in 1 hour.
                                        </p>
                                        {resetSent ? (
                                            <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold w-fit">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Reset link sent — check your inbox
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handlePasswordReset}
                                                disabled={resetLoading}
                                                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60"
                                            >
                                                {resetLoading
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <SendHorizonal className="w-4 h-4" />}
                                                Send Reset Link
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSubTab === 'activity' && (
                        <motion.div key="activity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                    <Activity className="w-7 h-7 text-slate-300" />
                                </div>
                                <h4 className="font-display font-bold text-slate-500 text-sm mb-1">No activity yet</h4>
                                <p className="text-xs text-slate-400 font-medium">Your session and survey activity will appear here.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PremiumTabLink = ({ icon, label, active, onClick, badge }) => (
    <button onClick={onClick} className={`relative py-4 px-6 md:px-8 flex items-center gap-3 transition-all group ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {React.cloneElement(icon, { size: 16, className: active ? 'stroke-[2.5px]' : 'stroke-2' })}
        <span className="text-[11px] font-black tracking-[0.2em] uppercase">{label}</span>
        {badge && <span className="hidden md:block absolute -top-1 -right-2 px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded-full border-2 border-white">{badge}</span>}
        {active && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
    </button>
);

const InputField = ({ label, value, onChange, disabled, icon, name, type = "text" }) => (
    <div className="space-y-2">
        {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}
        <div className="relative group">
            {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">{React.cloneElement(icon, { size: 18 })}</div>}
            <input name={name} type={type} value={value} onChange={onChange} disabled={disabled} className={`w-full ${icon ? 'pl-14' : 'px-6'} h-14 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all text-slate-900 text-sm font-bold placeholder:text-slate-300 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="Type your answer..." />
        </div>
    </div>
);

export default ProfileTab;
