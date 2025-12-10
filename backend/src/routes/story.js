const express = require('express');
const router = express.Router();
const {
  startQuestionnaire,
  nextQuestion,
  generateGist,
  createStory,
  regenerateStoryImages,
  getMyStories,
  getStory,
  generateTitles,
  regenerateTitles,
  deleteStory
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startQuestionnaire);
router.post('/next', protect, nextQuestion);
router.post('/gist', protect, generateGist);
router.post('/create', protect, createStory);
router.post('/regenerate', protect, regenerateStoryImages);
router.get('/my-stories', protect, getMyStories);
router.get('/:id', protect, getStory);

router.post('/titles/generate', protect, generateTitles);
router.post('/titles/regenerate', protect, regenerateTitles);
router.delete('/:id', protect, deleteStory);

module.exports = router;