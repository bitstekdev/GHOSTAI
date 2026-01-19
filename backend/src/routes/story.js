const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer(); 
const {
  startStory,
  nextQuestion,
  generateGist,
  createStory,
  renameStory,
  getMyStories,
  getStory,
  generateTitles,
  regenerateTitles,
  updateGist,
  customGenre,
  getCustomGenres,
  getConversation,
  deleteStory,
  deleteStoryForUser
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startStory);
router.post('/next', protect, nextQuestion);
router.post('/gist', protect, generateGist);
router.post('/create', protect, createStory);
router.patch("/rename/:storyId", protect, renameStory);
router.get('/my-stories', protect, getMyStories);
router.get('/:id', protect, getStory);

// Static routes (must come before dynamic `/:id`)
router.post(
  "/upload-genre",
  protect,
  upload.array("files"), 
  customGenre
);
router.get(
  "/custom-genres",
  protect,
  getCustomGenres
);

// Dynamic routes
router.patch('/:id/gist', protect, updateGist);

router.post('/titles/generate', protect, generateTitles);
router.post('/titles/regenerate', protect, regenerateTitles);
router.get('/:storyId/conversation', protect, getConversation);

// Delete story and associated data (**SENSITIVE**) it deletes all data from DB and S3
router.delete('/archive/:storyId', protect, deleteStoryForUser);
router.delete('/delete/:storyId', protect, deleteStory);

module.exports = router;