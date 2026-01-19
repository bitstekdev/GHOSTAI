const Story = require("../models/Story.js");
const { deleteFromS3 } = require("./s3Service.js");

exports.cleanupPreviewImages = async ({ storyId, userId }) => {
  const story = await Story.findOne({
    _id: storyId,
    user: userId,
  });

  if (!story || !Array.isArray(story.previewImages)) {
    return;
  }

  for (const img of story.previewImages) {
    if (img.s3Key && img.s3Key !== "reviewed") {
      try {
        await deleteFromS3(img.s3Key);
      } catch (err) {
        // Log only — do NOT fail book generation
        console.error("Failed to delete preview image:", img.s3Key, err);
      }
    }

    // Mark as reviewed
    img.s3Key = "reviewed";
    img.s3Url = "reviewed";
  }

  await story.save();
};
