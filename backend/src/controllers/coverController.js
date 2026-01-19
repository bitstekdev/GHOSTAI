const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const fastApiService = require('../services/fastApiService');
const s3Service = require('../services/s3Service');

// @desc    Generate cover and back cover
// @route   POST /api/cover/generate/:storyId
// @access  Private
exports.generateCover = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { qrUrl } = req.body;

    const story = await Story.findOne({
      _id: storyId,
      user: req.user.id
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Get all pages
    const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

    const pageData = pages.map(p => ({
      page: p.pageNumber,
      text: p.text,
      prompt: p.prompt
    }));

    // Call FastAPI
    const storyGenreString = Array.isArray(story.genres) ? story.genres.join(', ') : story.genre;
    const result = await fastApiService.generateCoverAndBack(
      pageData,
      storyGenreString,
      story.orientation,
      story.title,
      qrUrl || story.qrUrl
    );

    if (result.pages && result.pages[0]) {
      const coverData = result.pages[0];

      // Upload cover image
      let coverImage = null;
      if (coverData.cover_image_base64) {
        const coverBuffer = Buffer.from(coverData.cover_image_base64, 'base64');

        const s3CoverResult = await s3Service.uploadToS3(
          coverBuffer,
          `stories/${storyId}/covers`,
          'cover.png',
          'image/png'
        );

        coverImage = await Image.create({
          story: storyId,
          imageType: 'cover',
          s3Key: s3CoverResult.key,
          s3Url: s3CoverResult.url,
          s3Bucket: s3CoverResult.bucket,
          prompt: coverData.cover_prompt,
          mimeType: 'image/png',
          size: coverBuffer.length,
          metadata: {
            orientation: story.orientation,
            model: 'hidream'
          }
        });

        story.coverImage = coverImage._id;
      }

      // Upload back cover image
      let backCoverImage = null;
      if (coverData.back_image_base64) {
        const backBuffer = Buffer.from(coverData.back_image_base64, 'base64');

        const s3BackResult = await s3Service.uploadToS3(
          backBuffer,
          `stories/${storyId}/covers`,
          'back-cover.png',
          'image/png'
        );

        backCoverImage = await Image.create({
          story: storyId,
          imageType: 'backCover',
          s3Key: s3BackResult.key,
          s3Url: s3BackResult.url,
          s3Bucket: s3BackResult.bucket,
          prompt: coverData.back_prompt,
          mimeType: 'image/png',
          size: backBuffer.length,
          metadata: {
            orientation: story.orientation,
            model: 'hidream'
          }
        });

        story.backCoverImage = backCoverImage._id;
      }

      // Update story
      if (coverData.back_blurb) {
        story.backCoverBlurb = coverData.back_blurb;
      }
      if (qrUrl) {
        story.qrUrl = qrUrl;
      }
      await story.save();

      res.status(200).json({
        success: true,
        message: 'Cover and back cover generated successfully',
        data: {
          coverImage,
          backCoverImage,
          backCoverBlurb: coverData.back_blurb,
          titleUsed: result.title_used
        }
      });
    } else {
      throw new Error('Failed to generate cover images');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get cover images
// @route   GET /api/cover/:storyId
// @access  Private
exports.getCover = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      user: req.user.id
    })
      .populate('coverImage')
      .populate('backCoverImage');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        coverImage: story.coverImage,
        backCoverImage: story.backCoverImage,
        backCoverBlurb: story.backCoverBlurb
      }
    });
  } catch (error) {
    next(error);
  }
};
