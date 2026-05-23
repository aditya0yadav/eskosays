const express = require('express');
const router = express.Router();
const fraudController = require('./fraud.controller');

/**
 * POST /api/fraud/check
 *
 * Public — no auth required.
 * Called by the frontend as soon as an anonymous user opens a survey link.
 */
// Fraud Route definitions
router.post('/check', fraudController.check);
router.post('/ipqs-check', fraudController.ipqsCheck);
router.get('/recent', fraudController.recentActivities);
router.get('/service-config', fraudController.getServiceConfig);

module.exports = router;
