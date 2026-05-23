const express = require('express');
const router = express.Router();
const personaController = require('./controllers/persona.controller');
const { protect } = require('../../middleware/auth.middleware');

// Public or Protected depending on requirements, usually questions are public to show on onboarding
router.get('/questions', personaController.getQuestions);

// Protected routes for user profile
router.get('/profile', protect, personaController.getProfile);
router.post('/profile', protect, personaController.updateProfile);

module.exports = router;
