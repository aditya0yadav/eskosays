import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.eskosays.com/api';
const SERVER_BASE = API_BASE.replace(/\/api$/, '');

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [inputSearch, setInputSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 6 });
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            const res = await fetch(`${API_BASE}/blog?${params}`);
            const data = await res.json();
            setBlogs(data.blogs || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => {
        fetch(`${API_BASE}/blog/categories`)
            .then(r => r.json())
            .then(d => setCategories(d.categories || []))
            .catch(() => { });
    }, []);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(inputSearch.trim());
    };

    const handleCategory = (cat) => {
        setPage(1);
        setCategory(cat);
    };

    const featured = page === 1 && !search && !category ? blogs[0] : null;
    const rest = featured ? blogs.slice(1) : blogs;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

            {/* ── Editorial Hero ───────────────────────────────────────────── */}
            <section className="relative px-4 sm:px-[5%] pt-28 pb-20 lg:pt-36 lg:pb-28 bg-white border-b border-slate-100">
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">

                    {/* Left Typography */}
                    <div className="max-w-2xl">
                        {/* Minimal Eyebrow */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px w-10 sm:w-16 bg-emerald-400" />
                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] font-mono">
                                Eskosays Journal
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black text-[#0F1E3A] leading-[1.05] tracking-tight mb-8">
                            Insights, updates, <br />
                            <span className="text-slate-400">& stories.</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed pl-4 border-l-2 border-slate-100">
                            Stay informed with the latest news, tips, and research insights from our team and the broader market research industry.
                        </p>
                    </div>

                    {/* Right Search Box */}
                    <div className="flex-1 w-full max-w-md lg:pb-4">
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={inputSearch}
                                onChange={e => setInputSearch(e.target.value)}
                                className="w-full h-14 pl-12 pr-6 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 text-slate-700 font-medium transition-all"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F1E3A] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-500 transition-colors">
                                Search
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            {/* ── Main Content Grid ────────────────────────────────────────── */}
            <section className="px-4 sm:px-[5%] py-16 lg:py-24 max-w-[1200px] mx-auto w-full flex-1">

                {/* Minimal Filter Pills */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-16 border-b border-slate-200/60 pb-8">
                        <button
                            onClick={() => handleCategory('')}
                            className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${!category
                                ? 'bg-[#0F1E3A] text-white'
                                : 'text-slate-400 hover:text-[#0F1E3A] hover:bg-slate-100'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${category === cat
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-[400px]" />
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-32">
                        <h3 className="text-3xl font-black text-slate-300 mb-4">No insights found.</h3>
                        <p className="text-slate-500 text-lg">Try a different search term or category filter.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Asymmetrical Post */}
                        {featured && (
                            <Link to={`/blog/${featured.slug}`} className="group block mb-20 no-underline">
                                <article className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                    <div className="w-full lg:w-[480px] aspect-video overflow-hidden rounded-3xl bg-slate-100 relative shadow-xl shadow-slate-200/50 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F1E3A]/40 to-transparent z-10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        {featured.featured_image ? (
                                            <img
                                                src={featured.featured_image.startsWith('/') ? `${SERVER_BASE}${featured.featured_image}` : featured.featured_image}
                                                alt={featured.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-bottom"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                                <span className="text-emerald-200 font-bold text-6xl">Featured</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            {featured.category && (
                                                <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                                    {featured.category}
                                                </span>
                                            )}
                                            <span>{formatDate(featured.published_at)}</span>
                                        </div>

                                        <h2 className="text-3xl sm:text-5xl font-black text-[#0F1E3A] leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                                            {featured.title}
                                        </h2>

                                        <p className="text-lg text-slate-500 leading-relaxed font-medium line-clamp-3">
                                            {featured.excerpt}
                                        </p>

                                        <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[#0F1E3A] font-bold">
                                                    {featured.author?.charAt(0) || 'E'}
                                                </div>
                                                <span className="font-bold text-[#0F1E3A]">{featured.author || 'Editorial'}</span>
                                            </div>
                                            <span className="text-slate-400 group-hover:text-emerald-500 transition-colors flex items-center gap-2 font-bold text-sm">
                                                Read Article <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )}

                        {/* Minimal Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                            {rest.map(blog => (
                                <Link key={blog.id} to={`/blog/${blog.slug}`} className="group block no-underline h-full">
                                    <article className="h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-500">
                                        <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 mb-5 relative">
                                            {blog.featured_image ? (
                                                <img
                                                    src={blog.featured_image.startsWith('/') ? `${SERVER_BASE}${blog.featured_image}` : blog.featured_image}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100" />
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                                                {blog.category && <span className="text-emerald-500">{blog.category}</span>}
                                                {blog.category && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                                                <span>{formatDate(blog.published_at)}</span>
                                            </div>

                                            <h3 className="text-xl font-black text-[#0F1E3A] leading-snug mb-3 group-hover:text-emerald-500 transition-colors line-clamp-2">
                                                {blog.title}
                                            </h3>

                                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-6">
                                                {blog.excerpt}
                                            </p>

                                            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100 text-xs font-bold text-slate-400">
                                                <User className="w-3.5 h-3.5" />
                                                {blog.author || 'Editorial'}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {/* Minimal Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-20 pt-10 border-t border-slate-200">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-3 rounded-full text-slate-400 hover:text-[#0F1E3A] hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${page === i + 1
                                            ? 'bg-[#0F1E3A] text-white'
                                            : 'text-slate-500 hover:text-[#0F1E3A] hover:bg-slate-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-3 rounded-full text-slate-400 hover:text-[#0F1E3A] hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── Architectural CTA (Consistent) ──────────────────────────────── */}
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
}
