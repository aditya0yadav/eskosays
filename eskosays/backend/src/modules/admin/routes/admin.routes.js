const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../../../middleware/adminAuth.middleware');

// GET /api/admin/dashboard-stats
// Dashboard Stats
router.get('/dashboard-stats', adminAuth, adminController.getDashboardStats);

// User Management
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserDetails);
router.get('/leaderboard', adminAuth, adminController.getLeaderboard);

// Provider Management
router.get('/providers', adminAuth, adminController.getProviders);
router.patch('/providers/:id', adminAuth, adminController.updateProviderStatus);

// Survey Management (All Registry)
router.get('/surveys', adminAuth, adminController.getSurveys);

// Admin Profile & Settings
router.get('/profile', adminAuth, adminController.getAdminProfile);
router.put('/profile', adminAuth, adminController.updateAdminProfile);

// Fraud Settings
router.get('/settings/fraud-service', adminAuth, adminController.getFraudService);
router.put('/settings/fraud-service', adminAuth, adminController.updateFraudService);

module.exports = router;
