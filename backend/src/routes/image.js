const express = require('express');
const router = express.Router();
const {
  generateCharacterImages,
  generateBackgroundImages,
  getPageImages
} = require('../controllers/imageController');
const { protect } = require('../middleware/auth');

router.post('/generate-characters/:storyId', protect, generateCharacterImages);
router.post('/generate-backgrounds/:storyId', protect, generateBackgroundImages);
router.get('/page/:pageId', protect, getPageImages);

module.exports = router;