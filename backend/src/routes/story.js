const express = require('express');
const router = express.Router();
const {
  startStory,
  nextQuestion,
  generateGist,
  createStory,
  getMyStories,
  getStory,
  generateTitles,
  regenerateTitles,
  deleteStory,
  updateGist
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startStory);
router.post('/next', protect, nextQuestion);
router.post('/gist', protect, generateGist);
router.post('/create', protect, createStory);
router.get('/my-stories', protect, getMyStories);
router.get('/:id', protect, getStory);
router.patch('/:id/gist', protect, updateGist);

router.post('/titles/generate', protect, generateTitles);
router.post('/titles/regenerate', protect, regenerateTitles);
router.delete('/:id', protect, deleteStory);

module.exports = router;