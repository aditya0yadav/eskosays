const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('./blog.controller');
const { adminAuth } = require('../../middleware/adminAuth.middleware');

// ── Image Upload Config ───────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../public/uploads/blog');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `blog-${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ── Admin Routes (protected) ──────────────────────────────────────────────────
// IMPORTANT: must be defined BEFORE /:slug to avoid the wildcard swallowing "admin"
router.get('/admin/list', adminAuth, ctrl.adminListBlogs);
router.post('/admin/upload-image', adminAuth, upload.single('image'), ctrl.adminUploadImage);
router.get('/admin/:id', adminAuth, ctrl.adminGetBlog);
router.post('/admin', adminAuth, ctrl.adminCreateBlog);
router.put('/admin/:id', adminAuth, ctrl.adminUpdateBlog);
router.delete('/admin/:id', adminAuth, ctrl.adminDeleteBlog);

// ── Public Routes ─────────────────────────────────────────────────────────────
router.get('/', ctrl.listBlogs);
router.get('/categories', ctrl.getCategories);
router.get('/:slug', ctrl.getBlogBySlug);


module.exports = router;
