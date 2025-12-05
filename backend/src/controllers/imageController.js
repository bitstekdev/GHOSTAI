const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const fastApiService = require('../services/fastApiService');
const s3Service = require('../services/s3Service');

// @desc    Generate character images for story pages
// @route   POST /api/images/generate-characters/:storyId
// @access  Private
exports.generateCharacterImages = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    // Verify story ownership
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

    // Prepare data for FastAPI
    const pageData = pages.map(p => ({
      page: p.pageNumber,
      text: p.text,
      prompt: p.prompt
    }));

    // Call FastAPI to generate images
    const result = await fastApiService.generateImages(pageData, story.orientation);

    // Upload images to S3 and create Image documents
    const imagePromises = result.pages.map(async (pageResult) => {
      if (!pageResult.hidream_image_base64 || pageResult.error) {
        console.error(`Page ${pageResult.page} generation failed:`, pageResult.error);
        return null;
      }

      try {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(pageResult.hidream_image_base64, 'base64');

        // Upload to S3
        const s3Result = await s3Service.uploadToS3(
          imageBuffer,
          `stories/${storyId}/characters`,
          `page-${pageResult.page}.png`,
          'image/png'
        );

        // Create Image document
        const image = await Image.create({
          story: storyId,
          storyPage: pages[pageResult.page - 1]._id,
          imageType: 'character',
          s3Key: s3Result.key,
          s3Url: s3Result.url,
          s3Bucket: s3Result.bucket,
          prompt: pages[pageResult.page - 1].prompt,
          mimeType: 'image/png',
          size: imageBuffer.length,
          metadata: {
            orientation: story.orientation,
            model: 'hidream'
          }
        });

        // Update StoryPage with image reference
        await StoryPage.findByIdAndUpdate(pages[pageResult.page - 1]._id, {
          characterImage: image._id,
          status: 'completed'
        });

        return image;
      } catch (error) {
        console.error(`Error processing page ${pageResult.page}:`, error);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    const successfulImages = images.filter(img => img !== null);

    res.status(200).json({
      success: true,
      message: 'Character images generated successfully',
      data: {
        totalPages: pages.length,
        successfulGenerations: successfulImages.length,
        images: successfulImages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate background images for story pages
// @route   POST /api/images/generate-backgrounds/:storyId
// @access  Private
exports.generateBackgroundImages = async (req, res, next) => {
  try {
    const { storyId } = req.params;

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

    const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

    const pageData = pages.map(p => ({
      page: p.pageNumber,
      text: p.text
    }));

    // Call FastAPI SDXL endpoint
    const result = await fastApiService.generateSDXLBackgrounds(pageData, story.orientation);

    const imagePromises = result.pages.map(async (pageResult) => {
      if (!pageResult.sdxl_background_base64 || pageResult.error) {
        console.error(`Page ${pageResult.page} background failed:`, pageResult.error);
        return null;
      }

      try {
        const imageBuffer = Buffer.from(pageResult.sdxl_background_base64, 'base64');

        const s3Result = await s3Service.uploadToS3(
          imageBuffer,
          `stories/${storyId}/backgrounds`,
          `page-${pageResult.page}.png`,
          'image/png'
        );

        const image = await Image.create({
          story: storyId,
          storyPage: pages[pageResult.page - 1]._id,
          imageType: 'background',
          s3Key: s3Result.key,
          s3Url: s3Result.url,
          s3Bucket: s3Result.bucket,
          prompt: pageResult.sdxl_prompt,
          mimeType: 'image/png',
          size: imageBuffer.length,
          metadata: {
            orientation: story.orientation,
            model: 'sdxl'
          }
        });

        await StoryPage.findByIdAndUpdate(pages[pageResult.page - 1]._id, {
          backgroundImage: image._id,
          sdxlPrompt: pageResult.sdxl_prompt
        });

        return image;
      } catch (error) {
        console.error(`Error processing background ${pageResult.page}:`, error);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    const successfulImages = images.filter(img => img !== null);

    res.status(200).json({
      success: true,
      message: 'Background images generated successfully',
      data: {
        totalPages: pages.length,
        successfulGenerations: successfulImages.length,
        images: successfulImages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get images for a story page
// @route   GET /api/images/page/:pageId
// @access  Private
exports.getPageImages = async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const page = await StoryPage.findById(pageId)
      .populate('story')
      .populate('characterImage')
      .populate('backgroundImage')
      .populate('finalCompositeImage');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Verify ownership
    if (page.story.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        page,
        images: {
          character: page.characterImage,
          background: page.backgroundImage,
          composite: page.finalCompositeImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
