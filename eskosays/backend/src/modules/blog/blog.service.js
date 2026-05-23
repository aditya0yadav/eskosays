const { Blog } = require('../../models');
const { Op } = require('sequelize');

/**
 * Auto-generate a URL-safe slug from a title.
 * Appends a short timestamp suffix to ensure uniqueness.
 */
function generateSlug(title) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    return `${base}-${Date.now().toString(36)}`;
}

/**
 * List published blogs (public).
 * Supports search, category filter, and pagination.
 */
async function listPublishedBlogs({ page = 1, limit = 6, search = '', category = '' } = {}) {
    const offset = (page - 1) * limit;
    const where = { status: 'published' };

    if (search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { excerpt: { [Op.like]: `%${search}%` } }
        ];
    }
    if (category) {
        where.category = category;
    }

    const { count, rows } = await Blog.findAndCountAll({
        where,
        order: [['published_at', 'DESC']],
        limit: parseInt(limit),
        offset,
        attributes: ['id', 'title', 'slug', 'excerpt', 'featured_image', 'author', 'category', 'tags', 'published_at']
    });

    return {
        blogs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
    };
}

/**
 * Get a single published blog by slug (public).
 */
async function getPublishedBlogBySlug(slug) {
    return Blog.findOne({ where: { slug, status: 'published' } });
}

/**
 * List ALL blogs for admin (includes drafts).
 */
async function listAllBlogs({ page = 1, limit = 20, status = '' } = {}) {
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Blog.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset,
        attributes: ['id', 'title', 'slug', 'status', 'category', 'author', 'published_at', 'created_at']
    });

    return { blogs: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) };
}

/**
 * Get a single blog by ID (admin).
 */
async function getBlogById(id) {
    return Blog.findByPk(id);
}

/**
 * Create a new blog post.
 */
const ALLOWED_FIELDS = [
    'title', 'slug', 'excerpt', 'content', 'featured_image',
    'author', 'status', 'category', 'tags', 'meta_title',
    'meta_description', 'published_at'
];

function serializeTags(tags) {
    // Kept for safety — model getter/setter now handles this,
    // but we still normalize the value before passing to Sequelize.
    if (Array.isArray(tags)) return JSON.stringify(tags);
    if (typeof tags === 'string') {
        try { JSON.parse(tags); return tags; } catch { return '[]'; }
    }
    return '[]';
}

async function createBlog(data) {
    const slug = data.slug || generateSlug(data.title);
    const published_at = data.status === 'published' ? new Date() : null;
    const clean = {};
    ALLOWED_FIELDS.forEach(f => { if (data[f] !== undefined) clean[f] = data[f]; });
    // tags getter/setter on model handles JSON serialization automatically
    return Blog.create({ ...clean, slug, published_at });
}

/**
 * Update an existing blog post.
 */
async function updateBlog(id, data) {
    const blog = await Blog.findByPk(id);
    if (!blog) return null;

    // Whitelist only model-known fields to prevent Sequelize validation errors
    const update = {};
    ALLOWED_FIELDS.forEach(f => { if (data[f] !== undefined) update[f] = data[f]; });

    // Explicitly publish_at on first publish
    if (update.status === 'published' && blog.status !== 'published') {
        update.published_at = new Date();
    }

    // Regenerate slug only if title changed and no custom slug provided
    if (update.title && update.title !== blog.title && !update.slug) {
        update.slug = generateSlug(update.title);
    }

    // tags getter/setter on model handles JSON serialization automatically
    // but normalize the value just in case raw string was passed
    if (update.tags !== undefined && Array.isArray(update.tags)) {
        update.tags = JSON.stringify(update.tags);
    }

    console.log('[Blog] updateBlog fields:', Object.keys(update));
    await blog.update(update);
    return blog.reload();
}

/**
 * Delete a blog post.
 */
async function deleteBlog(id) {
    const blog = await Blog.findByPk(id);
    if (!blog) return null;
    await blog.destroy();
    return true;
}

/**
 * Get all unique categories from published blogs.
 */
async function getCategories() {
    const blogs = await Blog.findAll({
        where: { status: 'published' },
        attributes: ['category'],
        group: ['category']
    });
    return blogs.map(b => b.category).filter(Boolean);
}

module.exports = {
    listPublishedBlogs,
    getPublishedBlogBySlug,
    listAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    getCategories
};
