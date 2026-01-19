const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const ImageJob = require('../models/ImageJob');
const fastApiService = require('../services/fastApiService');
const s3Service = require('../services/s3Service');
const { runBookCreationJob } = require('../jobs/imageFunction');

// Remove outer HTML/doctype wrappers returned by the generator
const stripHtmlWrapper = (html) => {
  if (!html) return '';
  return html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/?head>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '')
    .trim();
};

// Helper: push the current image state into history with a descriptive label
const pushCurrentToHistory = (imageDoc, label = 'update') => {
  if (!imageDoc) return;
  imageDoc.oldImages.push({
    s3Key: imageDoc.s3Key,
    s3Url: imageDoc.s3Url,
    version: `${label}-${Date.now()}`
  });
};

// @desc    Create book image generation job
// @route   POST /api/images/create-book/:storyId
// @access  Private
exports.createBook = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { title } = req.body;

     // PREVENT duplicate jobs for same story
    const existingJob = await ImageJob.findOne({
      story: storyId,
      status: { $in: ["queued", "processing"] }
    });

    if (existingJob) {
      return res.status(409).json({
        success: false,
        message: "Book generation already in progress",
        jobId: existingJob._id
      });
    }

    const job = await ImageJob.create({
      story: storyId,
      user: req.user.id,
      status: "queued"
    });

    const payload = {
      storyId,
      userId: req.user.id,
      title
    };

    process.nextTick(() => {
      runBookCreationJob(job._id, payload);
    });

    // Update story: step + jobId
    const updateStory = await Story.findByIdAndUpdate(
      storyId,
      {
        step: 5,
        currentJob: job._id,
        status: "generating"
      },
      { new: true }
    );

    if (!updateStory) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    res.status(202).json({
      success: true,
      storyId,
      jobId: job._id
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get image job status
// @route   GET /api/images/job-status/:jobId
// @access  Private
exports.getJobStatus = async (req, res) => {
  const job = await ImageJob.findById(req.params.jobId);
  console.log("Get Job Status");
  res.json(job);
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


    // Normalize index values: UI sends -1, "", undefined, NaN → all become 0 (model semantics)
    const normalizeIndex = (val) => {
      const n = Number(val);
      if (Number.isInteger(n) && n >= 0) return n;
      return 0; // fallback for -1, NaN, undefined, empty strings
    };

    // Prepare options
    const options = {
      source_index: normalizeIndex(req.body.source_index),
      target_index: normalizeIndex(req.body.target_index),
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

    console.log("✅ FaceSwap FastAPI response keys:", Object.keys(swapResult));

    const swappedBase64 = swapResult.image_base64;

    console.log("📏 Base64 length:", swappedBase64?.length);

    if (!swappedBase64) {
      console.error("❌ FastAPI returned no image_base64");
      return res.status(500).json({
        success: false,
        message: "FastAPI returned no image_base64"
      });
    }

    // Save the current image into history before updating
    pushCurrentToHistory(imageDoc, 'faceswap');

    // Upload new swapped image to S3
    const buffer = Buffer.from(swappedBase64, "base64");

    try {
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

      // Return ONLY metadata, not full imageDoc
      return res.json({
        success: true,
        message: "Face swap updated successfully",
        imageId: imageDoc._id,
        imageUrl: imageDoc.s3Url
      });

    } catch (s3Error) {
      console.error("❌ S3 upload failed:", s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

  } catch (err) {
    console.error("🔥 FaceSwap controller error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};


// @desc    Edit image by face swapping
// @route   POST /api/v1/images/edit
// @access  Private
exports.editImage = async (req, res) => {
  try {
    const { characterImageId, prompt } = req.body;

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

    // 4️⃣ Save the current image into history before updating
    pushCurrentToHistory(imageDoc, 'edit');

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
      model: "edit",
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
      orientation: orientation || story.orientation,
      genre: Array.isArray(story.genres)
        ? story.genres.join(", ")
        : story.genre || "Family"
    };

    // console.log("Payload to FastAPI:", apiPayload);

    //-------------------------------------------------------------
    // Call FastAPI
    //-------------------------------------------------------------
    const regenResult = await fastApiService.regenerateImages(apiPayload);

    console.log("Regenerate Result from FastAPI:", regenResult);

    const pageResp = regenResult?.pages?.[0] || {};
    const base64 =
      pageResp.image_path ||
      pageResp.image_base64 ||
      pageResp.hidream_image_base64;

    // Extract regenerated story, HTML, and prompt (keep wrappers intact)
    const newStory = pageResp.new_story || pageResp.text || page.text;
    const newHtml = pageResp.new_html || pageResp.html || page.html || newStory;
    const newPrompt = pageResp.new_prompt || pageResp.prompt || page.prompt;

    // ------------------------------------------------------------------------------------
    // TEXT-ONLY REGENERATION (VALID SUCCESS CASE — no image returned)
    // ------------------------------------------------------------------------------------
    if (!base64) {
      // Save old story version
      page.oldStory.push({
        pageNumber: page.pageNumber,
        text: page.text,
        prompt: page.prompt,
        version: `regen-text-${page.oldStory.length + 1}`
      });

      // Update story content only
      page.text = newStory;
      page.html = newHtml;
      page.prompt = newPrompt;
      page.status = "text-regenerated";

      await page.save();

      return res.json({
        success: true,
        message: "Text regenerated successfully. Image unchanged.",
        imageUnchanged: true,
        pageId: page._id
      });
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

    // Update page story, HTML, and prompt
    page.text = newStory;
    page.html = newHtml;
    page.prompt = newPrompt;
    await page.save();

    // ------------------------------------------------------------------------------------
    //  SAVE CURRENT IMAGE INTO HISTORY BEFORE UPDATING
    // ------------------------------------------------------------------------------------
    if (existingImage) {
      pushCurrentToHistory(existingImage, 'regenerate');
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


// @desc    Revert image to a previous version
// @route   POST /api/images/revert
// @access  Private
exports.revertImage = async (req, res) => {
  try {
    const { imageId, versionIndex } = req.body;

    if (!imageId || versionIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "imageId and versionIndex are required"
      });
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    const old = image.oldImages[versionIndex];

    if (!old) {
      return res.status(404).json({
        success: false,
        message: "Requested version does not exist"
      });
    }

    // If already at this version, do nothing
    if (old.s3Key === image.s3Key) {
      return res.json({
        success: true,
        message: "Image already at requested version",
        image
      });
    }

    // Preserve current image before swapping so it can be reverted again
    image.oldImages.push({
      s3Key: image.s3Key,
      s3Url: image.s3Url,
      version: `revert-from-${old.version}`
    });

    // Swap to selected old image
    image.s3Key = old.s3Key;
    image.s3Url = old.s3Url;

    // Remove the restored version from history to avoid duplication
    image.oldImages.splice(versionIndex, 1);

    image.metadata = {
      ...image.metadata,
      model: "revert",
      revertedFromVersion: old.version,
      revertedAt: Date.now()
    };

    await image.save();

    return res.json({
      success: true,
      message: "Image reverted successfully",
      image
    });

  } catch (err) {
    console.error("Revert Image Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
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

// @desc    Generate gist preview images (no storage)
// @route   POST /api/images/gist/preview-images
// @access  Private
exports.gistPreviewImages = async (req, res, next) => {
  try {
    const { gist, genre, genres } = req.body;
    console.log("Gist Preview Images Request:", req.body);
    console.log("User ID:", req.user.id);

    if (!gist) {
      return res.status(400).json({
        success: false,
        message: 'gist is required'
      });
    }

    // Accept either `genres` (array) or `genre` (string). Normalize to array.
    let genresToSend = ['Family'];
    if (Array.isArray(genres) && genres.length > 0) {
      genresToSend = genres;
    } else if (genre) {
      genresToSend = [genre];
    }

    const previews = await fastApiService.generateGistPreviewImages({
      userId: req.user.id,
      genres: genresToSend,
      gist
    });

    return res.json({
      success: true,
      previews
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Promote a selected preview image: upload to S3 and create Image doc
// @route   POST /api/images/promote-preview
// @access  Private
exports.promotePreviewImage = async (req, res, next) => {
  try {
    const {
      storyId,
      imageType,
      orientation,
      base64,
      prompt
    } = req.body;

    if (!storyId || !imageType || !base64) {
      return res.status(400).json({
        success: false,
        message: 'storyId, imageType, and base64 are required'
      });
    }

    const buffer = Buffer.from(base64, 'base64');

    // Upload to S3
    const s3Result = await s3Service.uploadToS3(
      buffer,
      `stories/${storyId}/${imageType}`,
      `${imageType}-${Date.now()}.png`,
      'image/png'
    );

    // If replacing cover, update existing document safely
    if (imageType === 'cover') {
      const existingCover = await Image.findOne({ story: storyId, imageType: 'cover' });
      if (existingCover) {
        pushCurrentToHistory(existingCover, 'replace-cover');
        existingCover.s3Key = s3Result.key;
        existingCover.s3Url = s3Result.url;
        existingCover.s3Bucket = s3Result.bucket;
        existingCover.size = buffer.length;
        existingCover.prompt = prompt || existingCover.prompt;
        existingCover.mimeType = 'image/png';
        existingCover.metadata = Object.assign({}, existingCover.metadata, { orientation, model: 'hidream' });
        await existingCover.save();
        return res.json({ success: true, image: existingCover });
      }
    }

    // Create canonical Image
    const image = await Image.create({
      story: storyId,
      imageType,
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      s3Bucket: s3Result.bucket,
      prompt,
      mimeType: 'image/png',
      size: buffer.length,
      metadata: {
        model: 'hidream',
        orientation
      }
    });

    return res.json({
      success: true,
      image
    });

  } catch (err) {
    next(err);
  }
};