const express = require('express');
const router = express.Router();
const surveyController = require('./controllers/survey.controller')

const { protect } = require('../../middleware/auth.middleware');

// GET /api/survey - Get aggregated surveys from all providers
router.get('/', protect, surveyController.getSurveys);

// GET /api/survey/:provider/:surveyId/initiate - Initiate survey entry
router.get('/:provider/:surveyId/initiate', protect, surveyController.initiateSurvey);

// Callbacks (Unprotected as they come from provider servers/redirects)
const trackingController = require('./controllers/tracking.controller');
router.get('/callback/goweb', trackingController.handleGoWebCallback);
// NOTE: Zamplia callback is now handled at /api/index/callback (zamplia.callback.controller.js)
// The old /api/survey/callback/zamplia route has been removed to prevent routing bypass.

// Qualification Mapping Routes
const mappingController = require('./controllers/mapping.controller');
const { adminAuth } = require('../../middleware/adminAuth.middleware');

router.get('/mappings/initial-data', adminAuth, mappingController.getInitialData);
router.get('/mappings/:providerId', adminAuth, mappingController.getProviderMappings);
router.post('/mappings/attribute', adminAuth, mappingController.saveAttributeMapping);
router.post('/mappings/option', adminAuth, mappingController.saveOptionMapping);

module.exports = router;
