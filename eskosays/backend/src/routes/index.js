const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const personaRoutes = require('../modules/persona/persona.routes');
const userRoutes = require('../modules/user/routes/user.routes');
const surveyRoutes = require('../modules/survey/survey.routes');
const adminRoutes = require('../modules/admin/routes/admin.routes');
const blogRoutes = require('../modules/blog/blog.routes');
const fraudRoutes = require('../modules/fraud/fraud.routes');
const { handleZampliaUnifiedCallback } = require('../modules/survey/controllers/zamplia.callback.controller');

router.use('/auth', authRoutes);
router.use('/persona', personaRoutes);
router.use('/user', userRoutes);
router.use('/survey', surveyRoutes);
router.use('/admin', adminRoutes);
router.use('/blog', blogRoutes);
router.use('/fraud', fraudRoutes);

// Unified Zamplia callback — shared entry point for all services using the same Zamplia account
// This matches the redirect URLs configured in Zamplia: https://api.eskosays.com/api/index/callback
router.get('/index/callback', handleZampliaUnifiedCallback);

router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

module.exports = router;
