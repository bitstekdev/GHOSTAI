const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const ImageJob = require('../models/ImageJob');
const fastApiService = require('../services/fastApiService');
const s3Service = require('../services/s3Service');
const { emitJobUpdate } = require("../services/socket");


// IMAGE JOB FUNCTION
// const runBookCreationJob = async (jobId, payload) => {
//   try {
//     await ImageJob.findByIdAndUpdate(jobId, {
//       status: "processing",
//       startedAt: new Date()
//     });

//     // STEP 1: Characters
//     emitJobUpdate(jobId, { step: "characters", progress: 10 });

//     await generateCharacterImagesLogic({
//       storyId: payload.storyId,
//       userId: payload.userId,
//       title: payload.title
//     });

//     await ImageJob.findByIdAndUpdate(jobId, {
//       step: "backgrounds",
//       progress: 50
//     });

//     emitJobUpdate(jobId, { step: "backgrounds", progress: 50 });

//     // STEP 2: Backgrounds
//     await generateBackgroundImagesLogic(payload.storyId);

//     await ImageJob.findByIdAndUpdate(jobId, {
//       step: "cover",
//       progress: 80
//     });

//     emitJobUpdate(jobId, { step: "cover", progress: 80 });

//     // STEP 3: Cover
//     await generateCoverLogic(payload.storyId);

//     await ImageJob.findByIdAndUpdate(jobId, {
//       status: "completed",
//       step: "done",
//       progress: 100,
//       completedAt: new Date()
//     });

//     await Story.findByIdAndUpdate(payload.storyId, {
//         currentJob: null,
//         step: 6,
//         status: "completed"
//     });

//     emitJobUpdate(jobId, { step: "done", progress: 100 });

//   } catch (err) {
//     await ImageJob.findByIdAndUpdate(jobId, {
//       status: "failed",
//       error: err.message
//     });

//     emitJobUpdate(jobId, {
//       status: "failed",
//       error: err.message
//     });
//   }
// };

const emitSmoothProgress = (jobId, base, range, current, total) => {
  const percent = Math.floor(base + (current / total) * range);
  emitJobUpdate(jobId, { progress: percent });
};


const runBookCreationJob = async (jobId, payload) => {
  try {
    // 1️⃣ Load job state from DB
    const job = await ImageJob.findById(jobId);
    if (!job) return;

    // Prevent duplicate execution
    if (job.status === "completed") return;

    // Mark processing (do NOT reset startedAt if already set)
    if (job.status !== "processing") {
      await ImageJob.findByIdAndUpdate(jobId, {
        status: "processing",
        startedAt: job.startedAt || new Date()
      });
    }

    /**
     * STEP 1️⃣ CHARACTERS
     */
    if (!job.step || job.step === "characters") {

        await ImageJob.findByIdAndUpdate(jobId, {
            step: "characters",
            progress: 10,
            status: "processing"
        });

      emitJobUpdate(jobId, { step: "characters", progress: 10 });

      await generateCharacterImagesLogic({
        storyId: payload.storyId,
        userId: payload.userId,
        title: payload.title,
        jobId: jobId
      });

      await ImageJob.findByIdAndUpdate(jobId, {
        step: "backgrounds",
        progress: 50
      });
    }

    /**
     * STEP 2️⃣ BACKGROUNDS
     */
    const jobAfterCharacters = await ImageJob.findById(jobId);
    if (jobAfterCharacters.step === "backgrounds") {
      emitJobUpdate(jobId, { step: "backgrounds", progress: 50 });

      await generateBackgroundImagesLogic(payload.storyId, jobId);

      await ImageJob.findByIdAndUpdate(jobId, {
        step: "cover",
        progress: 80
      });
    }

    /**
     * STEP 3️⃣ COVER
     */
    const jobAfterBackgrounds = await ImageJob.findById(jobId);
    if (jobAfterBackgrounds.step === "cover") {
      emitJobUpdate(jobId, { step: "cover", progress: 80 });

      await generateCoverLogic(payload.storyId, jobId);

      await ImageJob.findByIdAndUpdate(jobId, {
        status: "completed",
        step: "done",
        progress: 100,
        completedAt: new Date()
      });

      await Story.findByIdAndUpdate(payload.storyId, {
        currentJob: null,
        step: 6,
        status: "completed"
      });

      emitJobUpdate(jobId, { step: "done", progress: 100 });
    }

  } catch (err) {
    await ImageJob.findByIdAndUpdate(jobId, {
      status: "failed",
      error: err.message
    });

    await Story.findByIdAndUpdate(payload.storyId, {
      currentJob: null,
      status: "failed"
    });

    emitJobUpdate(jobId, {
      status: "failed",
      error: err.message
    });
  }
};


// CHARACTER IMAGE GENERATION JOBS
const generateCharacterImagesLogic = async ({ storyId, userId, title, jobId }) => {
    console.log("Generating character images for story:", storyId, userId, title);
    emitJobUpdate(jobId, { progress: 11 });
  // Verify story ownership
  const story = await Story.findOne({
    _id: storyId,
    user: userId
  });

  if (!story) {
    throw new Error("Story not found");
  }

  await Story.findByIdAndUpdate(
    storyId,
    { title },
    { new: true }
  );

  const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

  const pageData = pages.map(p => ({
    page: p.pageNumber,
    text: p.text,
    prompt: p.prompt
  }));

  const storyGenreString = Array.isArray(story.genres)
    ? story.genres.join(", ")
    : story.genre;

    emitJobUpdate(jobId, { progress: 15 });

  const result = await fastApiService.generateImages(
    pageData,
    story.orientation,
    storyGenreString
  );

  const imagePromises = result.pages.map(async (pageResult, index) => {
    if (!pageResult.hidream_image_base64 || pageResult.error) {
      console.error(`Page ${pageResult.page} generation failed`, pageResult.error);
      return null;
    }

    const imageBuffer = Buffer.from(
      pageResult.hidream_image_base64,
      "base64"
    );

    const s3Result = await s3Service.uploadToS3(
      imageBuffer,
      `stories/${storyId}/characters`,
      `page-${pageResult.page}.png`,
      "image/png"
    );

    const image = await Image.create({
      story: storyId,
      storyPage: pages[pageResult.page - 1]._id,
      imageType: "character",
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      s3Bucket: s3Result.bucket,
      prompt: pages[pageResult.page - 1].prompt,
      mimeType: "image/png",
      size: imageBuffer.length,
      metadata: {
        orientation: story.orientation,
        model: "hidream"
      }
    });

    try {
      await StoryPage.findByIdAndUpdate(
        pages[pageResult.page - 1]._id,
        { characterImage: image._id, status: "completed" }
      );

      emitSmoothProgress(story.currentJob, 10, 40, index + 1, pages.length);

      return image;
    } catch (err) {
      await StoryPage.findByIdAndUpdate(
        pages[pageResult.page - 1]._id,
        { characterImage: image._id, status: "failed" }
      );
      return null;
    }
  });

  const images = await Promise.all(imagePromises);
  const successfulImages = images.filter(Boolean);

  return {
    totalPages: pages.length,
    successfulGenerations: successfulImages.length,
    images: successfulImages
  };
}



// BACKGROUND IMAGE GENERATION JOBS
const generateBackgroundImagesLogic = async (storyId, jobId) => {
  console.log("Generating background images for story:", storyId);
  emitJobUpdate(jobId, { progress: 51 });  
  const story = await Story.findOne({ _id: storyId });

  if (!story) {
    throw new Error("Story not found");
  }

  const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

  const pageData = pages.map(p => ({
    page: p.pageNumber,
    text: p.text
  }));

  const result = await fastApiService.generateFLUXBackgrounds(
    pageData,
    story.orientation
  );

  const imagePromises = result.pages.map(async (pageResult) => {
    if (!pageResult.flux_background_base64 || pageResult.error) {
      console.error(`Page ${pageResult.page} background failed`);
      return null;
    }

    const imageBuffer = Buffer.from(
      pageResult.flux_background_base64,
      "base64"
    );

    const s3Result = await s3Service.uploadToS3(
      imageBuffer,
      `stories/${storyId}/backgrounds`,
      `page-${pageResult.page}.png`,
      "image/png"
    );

    const image = await Image.create({
      story: storyId,
      storyPage: pages[pageResult.page - 1]._id,
      imageType: "background",
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      s3Bucket: s3Result.bucket,
      prompt: pageResult.flux_prompt,
      mimeType: "image/png",
      size: imageBuffer.length,
      metadata: {
        orientation: story.orientation,
        model: "flux"
      }
    });

    await StoryPage.findByIdAndUpdate(
      pages[pageResult.page - 1]._id,
      {
        backgroundImage: image._id,
        fluxPrompt: pageResult.flux_prompt
      }
    );
   emitJobUpdate(jobId, { progress: 79 });
    return image;
  });

  const images = await Promise.all(imagePromises);
  return images.filter(Boolean);
}



// COVER IMAGE GENERATION JOB
const generateCoverLogic = async (storyId, jobId) => {
  console.log("Generating cover images for story:", storyId);
  emitJobUpdate(jobId, { progress: 81 });
  const story = await Story.findOne({ _id: storyId });
  if (!story) throw new Error("Story not found");

  const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });

  const pageData = pages.map(p => ({
    page: p.pageNumber,
    text: p.text,
    prompt: p.prompt
  }));

  const genre = Array.isArray(story.genres)
    ? story.genres.join(", ")
    : story.genre;

  const qr_url = process.env.BACK_QR_URL || "https://talescraftco.com/";

  const result = await fastApiService.generateCoverAndBack(
    pageData,
    genre,
    story.orientation,
    story.title,
    qr_url
  );

  if (!result.pages || !result.pages[0]) {
    throw new Error("Failed to generate cover images");
  }

  const coverData = result.pages[0];

  if (coverData.cover_image_base64) {
    const buffer = Buffer.from(coverData.cover_image_base64, "base64");
    const s3 = await s3Service.uploadToS3(
      buffer,
      `stories/${storyId}/covers`,
      "cover.png",
      "image/png"
    );

    const image = await Image.create({
      story: storyId,
      imageType: "cover",
      s3Key: s3.key,
      s3Url: s3.url,
      s3Bucket: s3.bucket,
      prompt: coverData.cover_prompt,
      mimeType: "image/png",
      size: buffer.length,
      metadata: {
        orientation: story.orientation,
        model: "hidream"
      }
    });

    story.coverImage = image._id;
  }

  if (coverData.back_image_base64) {
    const buffer = Buffer.from(coverData.back_image_base64, "base64");
    const s3 = await s3Service.uploadToS3(
      buffer,
      `stories/${storyId}/covers`,
      "back-cover.png",
      "image/png"
    );

    const image = await Image.create({
      story: storyId,
      imageType: "backCover",
      s3Key: s3.key,
      s3Url: s3.url,
      s3Bucket: s3.bucket,
      prompt: coverData.back_prompt,
      mimeType: "image/png",
      size: buffer.length,
      metadata: {
        orientation: story.orientation,
        model: "hidream"
      }
    });

    story.backCoverImage = image._id;
  }
  emitJobUpdate(jobId, { progress: 99 });

  if (coverData.back_blurb) story.backCoverBlurb = coverData.back_blurb;
  story.qrUrl = qr_url;
  await story.save();
}

// EXPORTS
module.exports = {
  runBookCreationJob,
  generateCharacterImagesLogic,
  generateBackgroundImagesLogic,
  generateCoverLogic
};