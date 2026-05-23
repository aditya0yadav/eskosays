import React, { useState, useEffect } from 'react';
import api from '../../services/admin-api';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const QualificationMapping = () => {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [mappings, setMappings] = useState({});
    const [saving, setSaving] = useState(null); // 'attribute-id' or 'option-id-val'
    const [message, setMessage] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch mappings when provider changes
    useEffect(() => {
        if (selectedProvider) {
            fetchMappings(selectedProvider);
        } else {
            setMappings({});
        }
    }, [selectedProvider]);

    const fetchInitialData = async () => {
        try {
            const response = await api.get('/survey/mappings/initial-data');

            if (response.data.success) {
                setProviders(response.data.data.providers);
                setAttributes(response.data.data.attributes);
                if (response.data.data.providers.length > 0) {
                    setSelectedProvider(response.data.data.providers[0].id);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load initial data' });
            setLoading(false);
        }
    };

    const fetchMappings = async (providerId) => {
        try {
            const response = await api.get(`/survey/mappings/${providerId}`);

            if (response.data.success) {
                // Transform array to object for easier access
                const mappingMap = {};
                response.data.data.forEach(m => {
                    mappingMap[m.internal_key] = m;
                });
                setMappings(mappingMap);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load mappings' });
        }
    };

    const handleSaveAttribute = async (attribute) => {
        const mapping = mappings[attribute.key] || {};
        const payload = {
            provider_id: selectedProvider,
            internal_key: attribute.key,
            provider_question_key: mapping.provider_question_key || '',
            provider_question_id: mapping.provider_question_id || '',
            provider_question_title: mapping.provider_question_title || ''
        };

        if (!payload.provider_question_key) {
            setMessage({ type: 'error', text: 'Provider Question Key is required' });
            return;
        }

        setSaving(`attr-${attribute.id}`);
        try {
            const response = await api.post('/survey/mappings/attribute', payload);

            if (response.data.success) {
                // Update local state with the returned mapping including ID
                setMappings(prev => ({
                    ...prev,
                    [attribute.key]: {
                        ...prev[attribute.key],
                        ...response.data.data
                    }
                }));
                setMessage({ type: 'success', text: 'Attribute mapping saved!' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to save attribute mapping' });
        } finally {
            setSaving(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleSaveOption = async (attributeKey, option) => {
        const mapping = mappings[attributeKey];
        if (!mapping || !mapping.id) {
            setMessage({ type: 'error', text: 'Please save the attribute mapping first' });
            return;
        }

        const optionMappingRaw = mapping.optionMappings?.find(om => om.internal_value === option.value) || {};
        // We need to look at the current input value, not the saved one.
        // But for simplicity in this MVP, we bind inputs directly to the `mappings` state structure.
        // Since `optionMappings` is an array in the backend response but we might want easier access,
        // let's assume the input `onChange` updates a helper structure or directly the nested array.

        // Actually, let's look at how we handle state updates.
        // We'll trust the state is updated via onChange.

        const payload = {
            attribute_mapping_id: mapping.id,
            internal_value: option.value,
            provider_value: optionMappingRaw.provider_value || '',
            provider_option_text: optionMappingRaw.provider_option_text || ''
        };

        if (!payload.provider_value) {
            setMessage({ type: 'error', text: 'Provider Value is required' });
            return;
        }

        setSaving(`opt-${attributeKey}-${option.value}`);
        try {
            const response = await api.post('/survey/mappings/option', payload);

            if (response.data.success) {
                // Refresh mappings to get the standardized format back or update locally
                // Ideally we update locally to avoid flickering.
                // We need to update the specific option in the optionMappings array
                const updatedOptions = [...(mapping.optionMappings || [])];
                const existingIndex = updatedOptions.findIndex(om => om.internal_value === option.value);
                if (existingIndex >= 0) {
                    updatedOptions[existingIndex] = response.data.data;
                } else {
                    updatedOptions.push(response.data.data);
                }

                setMappings(prev => ({
                    ...prev,
                    [attributeKey]: {
                        ...prev[attributeKey],
                        optionMappings: updatedOptions
                    }
                }));

                setMessage({ type: 'success', text: 'Option mapping saved!' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to save option mapping' });
        } finally {
            setSaving(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const updateMappingState = (attrKey, field, value) => {
        setMappings(prev => ({
            ...prev,
            [attrKey]: {
                ...prev[attrKey],
                [field]: value
            }
        }));
    };

    const updateOptionState = (attrKey, internalVal, field, value) => {
        setMappings(prev => {
            const attrMapping = prev[attrKey] || {};
            const options = [...(attrMapping.optionMappings || [])];
            const existingIndex = options.findIndex(o => o.internal_value === internalVal);

            if (existingIndex >= 0) {
                options[existingIndex] = { ...options[existingIndex], [field]: value };
            } else {
                options.push({ internal_value: internalVal, [field]: value });
            }

            return {
                ...prev,
                [attrKey]: {
                    ...attrMapping,
                    optionMappings: options
                }
            };
        });
    };

    const getOptionValue = (attrKey, internalVal, field) => {
        const mapping = mappings[attrKey];
        if (!mapping || !mapping.optionMappings) return '';
        const opt = mapping.optionMappings.find(o => o.internal_value === internalVal);
        return opt ? opt[field] || '' : '';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900">Qualification Mapping</h1>

                    <div className="flex items-center gap-4">
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        >
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="grid gap-6">
                    {attributes.map(attr => (
                        <div key={attr.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Attribute Header */}
                            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {attr.title}
                                        <span className="text-xs font-normal px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-mono">
                                            {attr.key}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Type: {attr.type}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex-1 sm:flex-none">
                                        <input
                                            type="text"
                                            placeholder="Provider Question ID (e.g. GENDER_ID)"
                                            value={mappings[attr.key]?.provider_question_key || ''}
                                            onChange={(e) => updateMappingState(attr.key, 'provider_question_key', e.target.value)}
                                            className="w-full sm:w-64 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSaveAttribute(attr)}
                                        disabled={saving === `attr-${attr.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
                                        title="Save Attribute Mapping"
                                    >
                                        {saving === `attr-${attr.id}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Options Mapping */}
                            {attr.options && attr.options.length > 0 && (
                                <div className="p-6 bg-white">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Option Mapping</h4>
                                    <div className="grid gap-3">
                                        {attr.options.map((optionRaw, idx) => {
                                            const isObj = typeof optionRaw === 'object' && optionRaw !== null;
                                            const label = isObj ? optionRaw.label : optionRaw;
                                            const value = isObj ? optionRaw.value : optionRaw;

                                            return (
                                                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                                    <div className="w-1/3 text-sm font-medium text-slate-700">
                                                        {label}
                                                        <div className="text-xs text-slate-400 font-mono">{String(value)}</div>
                                                    </div>
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Provider Value Code"
                                                            value={getOptionValue(attr.key, value, 'provider_value')}
                                                            onChange={(e) => updateOptionState(attr.key, value, 'provider_value', e.target.value)}
                                                            className="flex-1 bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Text (Optional)"
                                                            value={getOptionValue(attr.key, value, 'provider_option_text')}
                                                            onChange={(e) => updateOptionState(attr.key, value, 'provider_option_text', e.target.value)}
                                                            className="hidden sm:block w-1/3 bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleSaveOption(attr.key, { value, label })}
                                                        disabled={saving === `opt-${attr.key}-${value}`}
                                                        className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 p-2 rounded-md transition-all disabled:opacity-50"
                                                        title="Save Option"
                                                    >
                                                        {saving === `opt-${attr.key}-${value}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default QualificationMapping;
