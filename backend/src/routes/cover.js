const express = require('express');
const router = express.Router();
const {
  generateCover,
  getCover
} = require('../controllers/coverController');
const { protect } = require('../middleware/auth');

router.post('/generate/:storyId', protect, generateCover);
router.get('/:storyId', protect, getCover);

module.exports = router;