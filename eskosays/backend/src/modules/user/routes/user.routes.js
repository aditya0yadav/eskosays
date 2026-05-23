const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../../../middleware/auth.middleware');
const upload = require('../../../utils/upload');

// All user routes are protected
router.use(protect);

router.get('/profile', userController.getProfile);
router.get('/summary', userController.getProfileSummary);
router.get('/wallet', userController.getWallet);
router.get('/home-stats', userController.getHomeStats);
router.put('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

module.exports = router;
