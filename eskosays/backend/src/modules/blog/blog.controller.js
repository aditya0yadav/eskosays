const blogService = require('./blog.service');
const path = require('path');

// ── Public Handlers ──────────────────────────────────────────────────────────

const listBlogs = async (req, res, next) => {
    try {
        const { page, limit, search, category } = req.query;
        const result = await blogService.listPublishedBlogs({ page, limit, search, category });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await blogService.getCategories();
        res.json({ categories });
    } catch (err) {
        next(err);
    }
};

const getBlogBySlug = async (req, res, next) => {
    try {
        const blog = await blogService.getPublishedBlogBySlug(req.params.slug);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        next(err);
    }
};

// ── Admin Handlers ───────────────────────────────────────────────────────────

const adminListBlogs = async (req, res, next) => {
    try {
        console.log('[Blog] adminListBlogs called | query:', req.query);
        const { page, limit, status } = req.query;
        const result = await blogService.listAllBlogs({ page, limit, status });
        console.log(`[Blog] adminListBlogs → ${result.total} blogs found`);
        res.json(result);
    } catch (err) {
        console.error('[Blog] adminListBlogs error:', err.message);
        next(err);
    }
};

const adminGetBlog = async (req, res, next) => {
    try {
        console.log('[Blog] adminGetBlog | id:', req.params.id);
        const blog = await blogService.getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error('[Blog] adminGetBlog error:', err.message);
        next(err);
    }
};

const adminCreateBlog = async (req, res, next) => {
    try {
        console.log('[Blog] adminCreateBlog | title:', req.body.title, '| status:', req.body.status);
        const blog = await blogService.createBlog(req.body);
        console.log('[Blog] adminCreateBlog → created id:', blog.id, '| slug:', blog.slug);
        res.status(201).json(blog);
    } catch (err) {
        console.error('[Blog] adminCreateBlog error:', err.message, err.stack);
        next(err);
    }
};

const adminUpdateBlog = async (req, res, next) => {
    try {
        console.log('[Blog] adminUpdateBlog | id:', req.params.id, '| status:', req.body.status);
        const blog = await blogService.updateBlog(req.params.id, req.body);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        console.log('[Blog] adminUpdateBlog → updated slug:', blog.slug);
        res.json(blog);
    } catch (err) {
        console.error('[Blog] adminUpdateBlog error:', err.message, err.stack);
        next(err);
    }
};

const adminDeleteBlog = async (req, res, next) => {
    try {
        console.log('[Blog] adminDeleteBlog | id:', req.params.id);
        const result = await blogService.deleteBlog(req.params.id);
        if (!result) return res.status(404).json({ message: 'Blog not found' });
        console.log('[Blog] adminDeleteBlog → deleted');
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('[Blog] adminDeleteBlog error:', err.message);
        next(err);
    }
};

const adminUploadImage = async (req, res, next) => {
    try {
        console.log('[Blog] adminUploadImage | file:', req.file?.originalname);
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const imageUrl = `/uploads/blog/${req.file.filename}`;
        console.log('[Blog] adminUploadImage → saved at:', imageUrl);
        res.json({ url: imageUrl });
    } catch (err) {
        console.error('[Blog] adminUploadImage error:', err.message);
        next(err);
    }
};

module.exports = {
    listBlogs,
    getCategories,
    getBlogBySlug,
    adminListBlogs,
    adminGetBlog,
    adminCreateBlog,
    adminUpdateBlog,
    adminDeleteBlog,
    adminUploadImage
};

