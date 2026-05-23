const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect, protectOrAdmin } = require('../../middleware/auth.middleware');
const vpnCheck = require('../../middleware/vpnCheck.middleware');

// Public routes (no VPN check needed here)
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Sign-in routes — VPN check applied
router.post('/login', vpnCheck, authController.login);
router.post('/firebase', vpnCheck, authController.firebaseAuth);
router.post('/admin/login', authController.adminLogin); // admin exempt from VPN check

// OTP routes — VPN check on verify only (send/retry are safe without it)
router.post('/otp/send', authController.sendOtp);
router.post('/otp/retry', authController.retryOtp);
router.post('/otp/verify', vpnCheck, authController.verifyOtp);

// Protected routes
router.get('/me', protectOrAdmin, authController.getMe);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;
