import React, { useState, useEffect } from 'react';
import personaService from '../../../services/persona.service';
import { HelpCircle, Save, CheckCircle2 } from 'lucide-react';

const QualificationManager = () => {
    const [profile, setProfile] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionsRes, profileRes] = await Promise.all([
                    personaService.getQuestions(),
                    personaService.getProfile()
                ]);

                if (questionsRes.success) {
                    setQuestions(questionsRes.data);
                }

                if (profileRes.success) {
                    const profileData = {};
                    profileRes.data.forEach(attr => {
                        profileData[attr.definition.key] = attr.value;
                    });
                    setProfile(profileData);
                }
            } catch (error) {
                console.error('Failed to fetch qualification data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (key, value) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            const response = await personaService.updateProfile(profile);
            if (response.success) {
                setMessage('Progress saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Failed to save qualifications:', error);
            setMessage('Error saving. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading assessments...</div>;

    // Filter out basic demographics
    const demographicKeys = ['age', 'gender', 'zip_code', 'country', 'marital_status'];
    const qualificationQuestions = questions.filter(q => !demographicKeys.includes(q.key));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Qualification Questions</h2>
                    <p className="text-sm text-slate-500">Help us match you with the right surveys.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save All</>}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-center text-white font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}>
                    {message}
                </div>
            )}

            <div className="grid gap-6">
                {qualificationQuestions.map(q => (
                    <div key={q.key} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-500">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 leading-snug">{q.title}</h3>

                                <div className="space-y-2">
                                    {q.type === 'boolean' ? (
                                        <div className="flex gap-4">
                                            {[true, false].map(val => (
                                                <button
                                                    key={String(val)}
                                                    onClick={() => handleChange(q.key, val)}
                                                    className={`px-6 py-2 rounded-xl border font-medium transition-all ${profile[q.key] === val ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                                                >
                                                    {val ? 'Yes' : 'No'}
                                                </button>
                                            ))}
                                        </div>
                                    ) : q.options ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {q.options.map(opt => {
                                                const isSelected = Array.isArray(profile[q.key]) ? profile[q.key].includes(opt) : profile[q.key] === opt;
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            if (q.type === 'multi-select') {
                                                                const current = profile[q.key] || [];
                                                                const updated = isSelected ? current.filter(i => i !== opt) : [...current, opt];
                                                                handleChange(q.key, updated);
                                                            } else {
                                                                handleChange(q.key, opt);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl border text-sm font-medium text-left transition-all flex items-center justify-between ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:border-blue-100 hover:bg-white'}`}
                                                    >
                                                        {opt}
                                                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <input
                                            type={q.type === 'number' ? 'number' : 'text'}
                                            value={profile[q.key] || ''}
                                            onChange={(e) => handleChange(q.key, e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Type your answer here..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QualificationManager;
