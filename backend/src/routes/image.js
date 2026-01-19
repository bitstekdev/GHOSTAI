const express = require('express');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

const router = express.Router();
const {
  // generateCharacterImages,
  // generateBackgroundImages,
  // generateCover,
  createBook,
  getJobStatus,
  faceSwap,
  editImage,
  regenerateCharacterImage,
  revertImage,
  getPageImages,
  testRoute,
  gistPreviewImages,
  promotePreviewImage,
} = require('../controllers/imageController');
const { protect } = require('../middleware/auth');

router.post('/generate-book/:storyId', protect, createBook);
router.get('/job-status/:jobId', protect, getJobStatus);
// router.post('/generate-characters/:storyId', protect, generateCharacterImages);
// router.post('/generate-backgrounds', protect, generateBackgroundImages);
// router.post('/generate-covers', protect, generateCover);
router.get('/page/:pageId', protect, getPageImages);

router.post('/faceswap', protect, upload.single("source"), faceSwap);
router.post('/edit', protect, editImage);
router.post('/regenerate', protect, regenerateCharacterImage);
router.post('/revert', protect, revertImage);



router.get('/test', testRoute);

// Preview generation (no storage) and promotion
router.post('/gist/preview-images', protect, gistPreviewImages);
// router.post('/gist/preview-images',  gistPreviewImages);
router.post('/promote-preview', protect, promotePreviewImage);

module.exports = router;