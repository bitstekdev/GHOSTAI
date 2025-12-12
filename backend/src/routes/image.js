const express = require('express');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

const router = express.Router();
const {
  generateCharacterImages,
  generateBackgroundImages,
  generateCover,
  faceSwap,
  editImage,
  regenerateCharacterImage,
  getPageImages, 
  testRoute,
} = require('../controllers/imageController');
const { protect } = require('../middleware/auth');

router.post('/generate-characters/:storyId', protect, generateCharacterImages);
router.get('/page/:pageId', protect, getPageImages);
router.post('/generate-backgrounds', protect, generateBackgroundImages);
router.post('/generate-covers', protect, generateCover);

router.post('/faceswap', protect, upload.single("source"), faceSwap);
router.post('/edit', protect, editImage);
router.post('/regenerate', protect, regenerateCharacterImage);



router.get('/test', testRoute);

module.exports = router;