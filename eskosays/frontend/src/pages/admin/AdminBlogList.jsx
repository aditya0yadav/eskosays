import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, CheckCircle, Clock, Search, RefreshCw, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.eskosays.com/api';

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminBlogList() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`${API_BASE}/blog/admin/list?${params}`, {
                headers: { Authorization: `Bearer ${getAdminToken()}` }
            });
            const data = await res.json();
            setBlogs(data.blogs || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            await fetch(`${API_BASE}/blog/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAdminToken()}` }
            });
            fetchBlogs();
        } catch (err) {
            alert('Failed to delete blog.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
                    <p className="text-slate-500 text-sm mt-1">{total} total articles</p>
                </div>
                <button
                    onClick={() => navigate('/admin/blogs/new')}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
                {['', 'published', 'draft'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                            }`}
                    >
                        {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
                <button onClick={fetchBlogs} className="ml-auto p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="space-y-3 p-6">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />)}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FileText className="w-10 h-10 mb-3 opacity-40" />
                        <p className="font-medium">No blog posts yet</p>
                        <p className="text-sm mt-1">Create your first post to get started</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Title</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Author</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {blogs.map(blog => (
                                <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900 line-clamp-1">{blog.title}</p>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">{blog.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="text-slate-600">{blog.category || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="text-slate-600">{blog.author}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {blog.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                <Clock className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{formatDate(blog.published_at || blog.created_at)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 justify-end">
                                            {blog.status === 'published' && (
                                                <a
                                                    href={`/blog/${blog.slug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Preview"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blog.id, blog.title)}
                                                disabled={deleting === blog.id}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 border border-slate-200 hover:border-indigo-400'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
