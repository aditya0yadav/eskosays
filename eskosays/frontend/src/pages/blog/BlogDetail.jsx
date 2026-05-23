import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { Calendar, ArrowLeft, Twitter, Linkedin, Link2, BookOpen, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.eskosays.com/api';
const SERVER_BASE = API_BASE.replace(/\/api$/, '');

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getImageUrl(src) {
    if (!src) return null;
    return src.startsWith('/') ? `${SERVER_BASE}${src}` : src;
}

export default function BlogDetail() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/blog/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then(data => setBlog(data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog?.title)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    };

    const shareLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0F1E3A] rounded-full animate-spin mb-4" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Journal...</span>
                </div>
            </div>
        );
    }

    if (notFound || !blog) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <BookOpen className="w-16 h-16 text-slate-300" />
                <h2 className="text-4xl font-black text-[#0F1E3A] tracking-tight">Article not found</h2>
                <Link to="/blog" className="text-emerald-500 font-bold hover:text-[#0F1E3A] transition-colors inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Return to Main Journal
                </Link>
            </div>
        );
    }

    const cleanContent = DOMPurify.sanitize(blog.content || '');
    const tags = Array.isArray(blog.tags) ? blog.tags : [];

    return (
        <>
            <Helmet>
                <title>{blog.meta_title || blog.title} | Eskosays Journal</title>
                <meta name="description" content={blog.meta_description || blog.excerpt || ''} />
                <meta property="og:title" content={blog.meta_title || blog.title} />
                <meta property="og:description" content={blog.meta_description || blog.excerpt || ''} />
                {blog.featured_image && <meta property="og:image" content={getImageUrl(blog.featured_image)} />}
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <article className="min-h-screen bg-white flex flex-col font-sans">

                {/* ── Editorial Header ────────────────────────────────────────── */}
                <header className="px-4 sm:px-[5%] pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-slate-100 bg-slate-50">
                    <div className="max-w-[1000px] mx-auto">

                        {/* Back Nav */}
                        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors mb-16">
                            <ArrowLeft className="w-4 h-4" /> Eskosays Journal
                        </Link>

                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                            <div className="flex-1 lg:max-w-[70%]">
                                {/* Eyebrow */}
                                    <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px w-10 sm:w-16 bg-emerald-400" />
                                    <span className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] font-mono">
                                        {blog.category || 'Eskosays Journal'}
                                    </span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-[#0F1E3A] leading-[1.05] tracking-tight mb-8">
                                    {blog.title}
                                </h1>

                                {blog.excerpt && (
                                    <p className="text-xl lg:text-2xl text-slate-500 leading-relaxed font-medium pl-6 border-l-4 border-slate-200">
                                        {blog.excerpt}
                                    </p>
                                )}
                            </div>

                            {/* Author & Meta Sidebar */}
                            <div className="w-full lg:w-[250px] flex flex-col gap-8 pt-2 lg:pt-16">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Written By</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                                            {blog.author?.charAt(0) || 'E'}
                                        </div>
                                        <span className="font-bold text-[#0F1E3A]">{blog.author || 'Editorial Team'}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Published On</span>
                                    <div className="flex items-center gap-2 font-medium text-slate-600">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        {formatDate(blog.published_at)}
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Share Article</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={shareTwitter} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white transition-all text-slate-400 bg-white">
                                            <Twitter className="w-4 h-4" />
                                        </button>
                                        <button onClick={shareLinkedIn} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all text-slate-400 bg-white">
                                            <Linkedin className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCopyLink} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-white ${copied ? 'border-emerald-400 text-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-500 hover:text-emerald-500 text-slate-400'}`}>
                                            <Link2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* ── Featured Image ───────────────────────────────────────────── */}
                {blog.featured_image && (
                    <div className="max-w-[800px] mx-auto px-4 w-full relative z-10 my-10">
                        <div className="rounded-2xl overflow-hidden aspect-[21/9] shadow-lg shadow-slate-200/50 bg-slate-100 relative">
                            <img
                                src={getImageUrl(blog.featured_image)}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* ── Blog Body ──────────────────────────────────────────────── */}
                <div className={`max-w-[800px] mx-auto px-4 w-full ${!blog.featured_image ? 'mt-20' : ''} pb-32`}>

                    {/* Add editorial custom CSS wrapper around DOMPurify content */}
                    <div
                        className="
                            prose prose-lg max-w-none 
                            prose-headings:font-black prose-headings:text-[#0F1E3A] prose-headings:tracking-tight 
                            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8
                            prose-a:text-emerald-500 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-[#0F1E3A]
                            prose-blockquote:border-l-4 prose-blockquote:border-emerald-400 prose-blockquote:bg-emerald-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:text-xl prose-blockquote:italic prose-blockquote:text-[#0F1E3A] prose-blockquote:rounded-r-2xl prose-blockquote:my-12
                            prose-li:text-slate-600 prose-ul:list-disc prose-ul:pl-6
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-12
                        "
                        dangerouslySetInnerHTML={{ __html: cleanContent }}
                    />

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mt-16 pt-10 border-t border-slate-100">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">Tags</span>
                            {tags.map(tag => (
                                <span key={tag} className="text-xs font-bold bg-slate-100 text-[#0F1E3A] px-4 py-2 rounded-full uppercase tracking-wider hover:bg-emerald-50 hover:text-emerald-600 cursor-default transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Architectural CTA ────────────────────────────────────────── */}
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

            </article>
        </>
    );
}
