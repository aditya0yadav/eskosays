import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuillEditor from '../../components/common/QuillEditor';
import {
    Save, Eye, Upload, X, ChevronLeft, CheckCircle,
    Clock, AlertCircle, Image, Tag, Globe
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.eskosays.com/api';
const SERVER_BASE = API_BASE.replace(/\/api$/, '');

function getAdminToken() { return localStorage.getItem('adminToken'); }

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

const INITIAL_FORM = {
    title: '', slug: '', excerpt: '', content: '',
    featured_image: '', author: 'Eskosays Team',
    status: 'draft', category: '', tags: '',
    meta_title: '', meta_description: ''
};

export default function AdminBlogEditor() {
    const navigate = useNavigate();
    const { id } = useParams(); // undefined = new, id = edit
    const isEdit = Boolean(id);

    const [form, setForm] = useState(INITIAL_FORM);
    const [slugManual, setSlugManual] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [lastSaved, setLastSaved] = useState(null);
    const fileInput = useRef();

    const draftKey = `blog_draft_${id || 'new'}`;
    const savingRef = useRef(false);

    // Load blog if editing
    useEffect(() => {
        if (!isEdit) {
            // Restore draft for new posts
            const saved = localStorage.getItem(draftKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setForm(parsed.form || INITIAL_FORM);
                    setSlugManual(parsed.slugManual || false);
                    setLastSaved(parsed.savedAt || null);
                } catch { }
            }
            return;
        }
        fetch(`${API_BASE}/blog/admin/${id}`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` }
        })
            .then(r => r.json())
            .then(data => {
                setForm({
                    title: data.title || '',
                    slug: data.slug || '',
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    featured_image: data.featured_image || '',
                    author: data.author || 'Eskosays Team',
                    status: data.status || 'draft',
                    category: data.category || '',
                    tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
                    meta_title: data.meta_title || '',
                    meta_description: data.meta_description || ''
                });
                setSlugManual(true);
            })
            .catch(() => showToast('error', 'Failed to load blog post'));
    }, [id]);

    // Autosave to localStorage with 1s debounce
    useEffect(() => {
        if (savingRef.current) return; // don't overwrite while actively saving
        const timer = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify({
                form,
                slugManual,
                savedAt: new Date().toISOString()
            }));
            setLastSaved(new Date().toISOString());
        }, 1000);
        return () => clearTimeout(timer);
    }, [form, slugManual]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleTitleChange = (val) => {
        set('title', val);
        if (!slugManual) set('slug', generateSlug(val));
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${API_BASE}/blog/admin/upload-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAdminToken()}` },
                body: fd
            });
            const data = await res.json();
            set('featured_image', data.url);
            showToast('success', 'Image uploaded successfully');
        } catch {
            showToast('error', 'Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (statusOverride) => {
        if (!form.title.trim()) { showToast('error', 'Title is required'); return; }
        setSaving(true);
        savingRef.current = true;
        try {
            const payload = {
                ...form,
                status: statusOverride || form.status,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            const url = isEdit ? `${API_BASE}/blog/admin/${id}` : `${API_BASE}/blog/admin`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAdminToken()}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error();
            localStorage.removeItem(draftKey); // clear draft on success
            showToast('success', isEdit ? 'Post updated!' : 'Post created!');
            setTimeout(() => navigate('/admin/blogs'), 1200);
        } catch {
            showToast('error', 'Failed to save post. Please try again.');
        } finally {
            setSaving(false);
            savingRef.current = false;
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/blogs')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {form.status === 'published' ? 'Published' : 'Draft'} · {isEdit ? 'Editing' : 'Creating'}
                            {lastSaved && (
                                <span className="ml-2 text-emerald-500 text-xs font-medium">
                                    · Draft saved {new Date(lastSaved).toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                        <Clock className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" /> {saving ? 'Saving…' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Main Editor */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <input
                            type="text"
                            placeholder="Post title…"
                            value={form.title}
                            onChange={e => handleTitleChange(e.target.value)}
                            className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none border-none bg-transparent"
                        />
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-mono">/blog/</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                                className="font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 flex-1 min-w-0"
                                placeholder="url-slug"
                            />
                        </div>
                    </div>

                    {/* Tab: Content / SEO */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex border-b border-slate-100">
                            {[['content', 'Content'], ['seo', 'SEO']].map(([tab, label]) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'content' ? (
                                <div className="space-y-5">
                                    {/* Excerpt */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Excerpt</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Short description shown in blog listing…"
                                            value={form.excerpt}
                                            onChange={e => set('excerpt', e.target.value)}
                                            className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 resize-none"
                                        />
                                    </div>

                                    {/* Rich Text Editor */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Content</label>
                                        <QuillEditor
                                            value={form.content}
                                            onChange={val => set('content', val)}
                                            minHeight={400}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" /> Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="SEO page title (max 60 chars)"
                                            value={form.meta_title}
                                            onChange={e => set('meta_title', e.target.value)}
                                            maxLength={60}
                                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">{form.meta_title.length}/60 chars</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Meta Description</label>
                                        <textarea
                                            rows={3}
                                            placeholder="SEO description (max 160 chars)"
                                            value={form.meta_description}
                                            onChange={e => set('meta_description', e.target.value)}
                                            maxLength={160}
                                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 resize-none"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">{form.meta_description.length}/160 chars</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-4">
                    {/* Featured Image */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Image className="w-4 h-4 text-slate-400" /> Featured Image
                        </h3>
                        {form.featured_image ? (
                            <div className="relative group">
                                <img
                                    src={form.featured_image.startsWith('/') ? `${SERVER_BASE}${form.featured_image}` : form.featured_image}
                                    alt="Featured"
                                    className="w-full aspect-video object-cover rounded-xl"
                                />
                                <button
                                    onClick={() => set('featured_image', '')}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-slate-500 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInput.current?.click()}
                                disabled={uploading}
                                className="w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all text-sm cursor-pointer"
                            >
                                {uploading ? (
                                    <><Upload className="w-6 h-6 mb-2 animate-bounce" /><span>Uploading…</span></>
                                ) : (
                                    <><Upload className="w-6 h-6 mb-2" /><span>Click to upload</span><span className="text-[11px] mt-1">PNG, JPG, WebP up to 5MB</span></>
                                )}
                            </button>
                        )}
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e.target.files[0])}
                        />
                        <div className="mt-3">
                            <input
                                type="text"
                                placeholder="Or paste image URL…"
                                value={form.featured_image}
                                onChange={e => set('featured_image', e.target.value)}
                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Post Settings */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700">Post Settings</h3>

                        {/* Status */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['draft', 'published'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => set('status', s)}
                                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${form.status === s
                                            ? s === 'published'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-amber-500 text-white border-amber-500'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Author */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Author</label>
                            <input
                                type="text"
                                value={form.author}
                                onChange={e => set('author', e.target.value)}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Category</label>
                            <input
                                type="text"
                                placeholder="e.g. Research, Survey Tips"
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Tag className="w-3 h-3" /> Tags
                            </label>
                            <input
                                type="text"
                                placeholder="tag1, tag2, tag3"
                                value={form.tags}
                                onChange={e => set('tags', e.target.value)}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Comma-separated</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
