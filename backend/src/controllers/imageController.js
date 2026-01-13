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
          // base64Data: pageResult.hidream_image_base64,
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
        
      try {
        // Update StoryPage with image reference
        await StoryPage.findByIdAndUpdate(pages[pageResult.page - 1]._id, {
          characterImage: image._id,
          status: 'completed'
        });

        console.log(`Page ${pageResult.page} image generated and stored successfully.`);

        return image;
      } catch (error) {
         await StoryPage.findByIdAndUpdate(pages[pageResult.page - 1]._id, {
          characterImage: image._id,
          status: 'failed'
        });
        console.error(`Error processing page ${pageResult.page}:`, error);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    const successfulImages = images.filter(img => img !== null);

    res.status(200).json({
      success: true,
      message: 'Character images generated successfully',
      storyId: storyId,
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
// @route   POST /api/images/generate-backgrounds/
// @access  Private
exports.generateBackgroundImages = async (req, res, next) => {
// const generateBackgroundImages = async (storyId) => {
  try {
    const { storyId } = req.body;

    const story = await Story.findOne({
      _id: storyId,
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
        console.log(`Page ${pageResult.page} image generated and stored successfully.`);

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
    console.error('Error generating background images:', error);
    next(error);
  }
};


// @desc    Generate cover and back cover for a story
// @route   POST /api/cover/generate/
// @access  Private
exports.generateCover = async (req, res, next) => {
// const generateCover = async (storyId) => {
  const { storyId } = req.body;
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
      const response = await story.save();
      console.log('Story save result:', response);

      console.log('Cover and back cover generated successfully.', story);
    
      res.status(200).json({
      success: true,
      message: 'Cover and back cover images generated successfully',
      data: {
        totalPages: pages.length,
      }
    });
    } else {
      throw new Error('Failed to generate cover images');
    }
  } catch (error) {
    console.error('Error generating cover images:', error);
    next(error);
  }
};


// @desc    Face swap source image onto character image
// @route   POST /api/images/faceswap
// @access  Private
exports.faceSwap = async (req, res) => {
  try {
    const sourceFile = req.file;
    const { characterImageId } = req.body;

    if (!sourceFile || !characterImageId) {
      return res.status(400).json({
        success: false,
        message: "source image and characterImageId are required",
      });
    }

    // Get the Image document from DB
    const imageDoc = await Image.findById(characterImageId);

    if (!imageDoc) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // const targetBuffer = Buffer.from(imageDoc.base64Data, "base64");
    const targetBuffer = await s3Service.getObjectFromS3(imageDoc.s3Key);
    console.log("FaceSwap - Target Buffer Length:", targetBuffer.length);


    // Prepare options
    const options = {
      source_index: parseInt(req.body.source_index),
      target_index: parseInt(req.body.target_index),
      upscale: parseInt(req.body.upscale || 0),
      codeformer_fidelity: parseFloat(req.body.codeformer_fidelity || 0.5),
      background_enhance: req.body.background_enhance !== "false",
      face_restore: req.body.face_restore !== "false",
      face_upsample: req.body.face_upsample === "true",
      output_format: req.body.output_format || "PNG",
    };

    //  Call FastAPI for swapping
    const swapResult = await fastApiService.faceSwap(
      sourceFile.buffer,
      targetBuffer,
      options
    );

    const swappedBase64 = swapResult.swapped_image;

    if (!swappedBase64) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate swapped image"
      });
    }

    // Save the old image into oldImages[]
    imageDoc.oldImages.push({
      // base64Data: imageDoc.base64Data,
      s3Url: imageDoc.s3Url,
      s3Key: imageDoc.s3Key,
      version: `v${imageDoc.oldImages.length + 1}`
    });

    // Upload new swapped image to S3
    const buffer = Buffer.from(swappedBase64, "base64");

    const s3Result = await s3Service.uploadToS3(
      buffer,
      `stories/${imageDoc.story}/faceswap`,
      `faceswap-${Date.now()}.png`,
      "image/png"
    );

    // Update DB with new image data
    // imageDoc.base64Data = swappedBase64;
    imageDoc.s3Key = s3Result.key;
    imageDoc.s3Url = s3Result.url;
    imageDoc.s3Bucket = s3Result.bucket;
    imageDoc.size = buffer.length;
    imageDoc.metadata = {
      ...imageDoc.metadata,
      model: "faceswap",
      generationTime: Date.now(),
    };

    await imageDoc.save();

    return res.json({
      success: true,
      message: "Face swap updated successfully",
      data: imageDoc
    });

  } catch (err) {
    console.error("FaceSwap Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.toString(),
    });
  }
};


// @desc    Edit image by face swapping
// @route   POST /api/v1/images/edit
// @access  Private
exports.editImage = async (req, res) => {
  try {
    const { characterImageId, prompt } = req.body;
    console.log("Edit Image Request:", req.body);

    if (!characterImageId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "characterImageId and prompt are required",
      });
    }

    // 1️⃣ Get the Image document from DB
    const imageDoc = await Image.findById(characterImageId);

    if (!imageDoc) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // const targetBuffer = Buffer.from(imageDoc.base64Data, "base64");
    const targetBuffer = await s3Service.getObjectFromS3(imageDoc.s3Key);



    console.log("Edit Image - Target Buffer Length:", targetBuffer.length); 
    // 3️⃣ Call FastAPI for swapping
    const editResult = await fastApiService.editImage(
      targetBuffer,
      prompt,
    );

    const editedBase64 = editResult.output_base64;

    if (!editedBase64) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate edited image"
      });
    }

    // 4️⃣ Save the old image into oldImages[]
    imageDoc.oldImages.push({
      // base64Data: imageDoc.base64Data,
      s3Url: imageDoc.s3Url,
      s3Key: imageDoc.s3Key,
      version: `v${imageDoc.oldImages.length + 1}`
    });

    // 5️⃣ Upload new swapped image to S3
    const buffer = Buffer.from(editedBase64, "base64");

    const s3Result = await s3Service.uploadToS3(
      buffer,
      `stories/${imageDoc.story}/edit`,
      `edit-${Date.now()}.png`,
      "image/png"
    );

    // 6️⃣ Update DB with new image data
    // imageDoc.base64Data = editedBase64;
    imageDoc.s3Key = s3Result.key;
    imageDoc.s3Url = s3Result.url;
    imageDoc.s3Bucket = s3Result.bucket;
    imageDoc.size = buffer.length;
    imageDoc.metadata = {
      ...imageDoc.metadata,
      model: "faceswap",
      generationTime: Date.now(),
    };

    await imageDoc.save();

    return res.json({
      success: true,
      message: "Image edited successfully",
      data: imageDoc
    });

  } catch (err) {
    console.error("Edit Image Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.toString(),
    });
  }
};

// @desc    Re-generate a character image for a page
// @route   POST /api/images/regenerate
// @access  Private
exports.regenerateCharacterImage = async (req, res) => {
  try {
    const { pageId, characterDetails, orientation } = req.body;
    // console.log("Regenerate Character Image Request:", req.body);

    if (!pageId || !characterDetails) {
      return res.status(400).json({
        success: false,
        message: "pageId and characterDetails are required"
      });
    }

    // 1️⃣ Get page + story + image
    const page = await StoryPage.findById(pageId).populate("story").populate("characterImage");
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

     const story = page.story;
     const existingImage = page.characterImage;

    // fromat character details
    const fixedCharacterDetails = characterDetails.map(cd => `${cd.name}: ${cd.details}`).join('\n');

    // 2️⃣ Build FastAPI payload
    const apiPayload = {
      pages: [
        {
          page: page.pageNumber,
          text: page.text,
          prompt: page.prompt,
          character_details: fixedCharacterDetails
        }
      ],
      orientation: orientation || story.orientation
    };

    // console.log("Payload to FastAPI:", apiPayload);

    //-------------------------------------------------------------
    // Call FastAPI
    //-------------------------------------------------------------
    const regenResult = await fastApiService.regenerateImages(apiPayload);

    // console.log("Regenerate Result from FastAPI:", regenResult);

    const newStory = regenResult?.pages?.[0]?.new_story;
    const newPrompt = regenResult?.pages?.[0]?.new_prompt;
    const base64 = regenResult?.pages?.[0]?.image_path;

    if (!base64) {
      return res.status(500).json({ success: false, message: "No image returned from FastAPI" });
    }

    // ------------------------------------------------------------------------------------
    //  SAVE OLD STORY DATA IN storyPage.oldStory[]
    // ------------------------------------------------------------------------------------
    page.oldStory.push({
      pageNumber: page.pageNumber,
      text: page.text,
      prompt: page.prompt,
      version: `regen-${page.oldStory.length + 1}`
    });

    // Update page story + prompt
    page.text = newStory;
    page.prompt = newPrompt;
    await page.save();

    // ------------------------------------------------------------------------------------
    //  SAVE OLD IMAGE DATA IN image.oldImages[]
    // ------------------------------------------------------------------------------------
    if (existingImage) {
      existingImage.oldImages.push({
        s3Key: existingImage.s3Key,
        s3Url: existingImage.s3Url,
        version: `regen-${existingImage.oldImages.length + 1}`
      });
    }

    // ------------------------------------------------------------------------------------
    // Upload new regenerated image
    // ------------------------------------------------------------------------------------
    const buffer = Buffer.from(base64, "base64");

    const s3Result = await s3Service.uploadToS3(
      buffer,
      `stories/${story._id}/regenerated`,
      `regen-page-${page.pageNumber}-${Date.now()}.png`,
      "image/png"
    );

    if (!existingImage)
      return res.status(500).json({ success: false, message: "Image document missing" });

    existingImage.s3Key = s3Result.key;
    existingImage.s3Url = s3Result.url;
    existingImage.s3Bucket = s3Result.bucket;
    existingImage.size = buffer.length;
    existingImage.prompt = newPrompt;
    existingImage.metadata = {
      ...existingImage.metadata,
      model: "regenerate",
      regeneratedAt: Date.now()
    };

    await existingImage.save();

    // ------------------------------------------------------------------------------------
    // Update StoryPage reference
    // ------------------------------------------------------------------------------------
    await StoryPage.findByIdAndUpdate(pageId, {
      status: "regenerated",
      characterImage: existingImage._id
    });

    return res.json({
      success: true,
      message: "Character image regenerated successfully",
      image: existingImage
    });

  } catch (err) {
    console.error("Regenerate Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.toString()
    });
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