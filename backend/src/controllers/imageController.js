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
    const { title } = req.body;

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

    const updateTitle = await Story.findByIdAndUpdate(
      storyId,
      { title: title },
      { new: true }
    );

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
          base64Data: pageResult.hidream_image_base64,
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

        console.log(`Page ${pageResult.page} image generated and stored successfully.`);

        return image;
      } catch (error) {
        console.error(`Error processing page ${pageResult.page}:`, error);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    const successfulImages = images.filter(img => img !== null);

    const backgroundImages = await generateBackgroundImages(storyId);
    console.log("Background Images Generated:", backgroundImages);
    const coverImages = await generateCover(storyId);
    console.log("Cover Images Generated:", coverImages);

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
// exports.generateBackgroundImages = async (req, res, next) => {
const generateBackgroundImages = async (storyId) => {
  try {
    // const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      // user: req.user.id
    });

    if (!story) {
      return {
        success: false,
        message: 'Story not found'
      };
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

    // res.status(200).json({
    //   success: true,
    //   message: 'Background images generated successfully',
    //   data: {
    //     totalPages: pages.length,
    //     successfulGenerations: successfulImages.length,
    //     images: successfulImages
    //   }
    // });
    return successfulImages;
  } catch (error) {
    // next(error);
    console.error('Error generating background images:', error);
  }
};


// @desc    Generate cover and back cover for a story
// @route   POST /api/cover/generate/:storyId
// @access  Private
// exports.generateCover = async (req, res, next) => {
const generateCover = async (storyId) => {
  try {
    
    const story = await Story.findOne({
      _id: storyId,
    });

    if (!story) {
      return {
        success: false,
        message: 'Story not found'
      };
    }

    // Get all pages
    const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

    const pageData = pages.map(p => ({
      page: p.pageNumber,
      text: p.text,
      prompt: p.prompt
    }));

    const qr_url = process.env.BACK_QR_URL || 'https://talescraftco.com/';

    // Call FastAPI coverback/generate endpoint
    const result = await fastApiService.generateCoverAndBack(
      pageData,
      story.genre,
      story.orientation,
      story.title,
      qr_url
    );

    if (result.pages && result.pages[0]) {
      const coverData = result.pages[0];

      // Upload cover image to S3
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

      // Upload back cover image to S3
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

      // Update story with blurb and QR URL
      if (coverData.back_blurb) {
        story.backCoverBlurb = coverData.back_blurb;
      }
      if (qr_url) {
        story.qrUrl = qr_url;
      }
      const result = await story.save();
      console.log('Story save result:', result);

      console.log('Cover and back cover generated successfully.', story);
      
      // res.status(200).json({
      //   success: true,
      //   message: 'Cover and back cover generated successfully',
      //   data: {
      //     coverImage,
      //     backCoverImage,
      //     backCoverBlurb: coverData.back_blurb,
      //     titleUsed: result.title_used
      //   }
      // });
      return story; 
    } else {
      throw new Error('Failed to generate cover images');
    }
  } catch (error) {
    // next(error);
    console.error('Error generating cover images:', error);
    return null;
  }
};


// @desc    Get images for a story page
// @route   GET /api/images/page/:pageId
// @access  Private
exports.getPageImages = async (req, res, next) => {
  generateCover()
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


// test route 
exports.testRoute = async (req, res, next) => {
  const storyId = "6935bf795b1ae90ed9afc6a5"
  try {
   const result = await generateCover(storyId)
   console.log("Test Route Cover Result:", result);
    res.status(200).json({
      success: true,
      result,
      message: 'Test route working'
    });
  }
  catch (error) {
    next(error);
  }
};