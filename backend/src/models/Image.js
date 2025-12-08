const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  },
  storyPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoryPage'
  },
  imageType: {
    type: String,
    enum: ['character', 'background', 'composite', 'cover', 'backCover'],
    required: true
  },
  base64Data: String,
  s3Key: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: true
  },
  s3Bucket: {
    type: String,
    required: true
  },
  prompt: String,
  originalFilename: String,
  mimeType: {
    type: String,
    default: 'image/png'
  },
  size: Number,
  width: Number,
  height: Number,
  metadata: {
    generationTime: Number,
    model: String,
    orientation: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
imageSchema.index({ story: 1, imageType: 1 });
imageSchema.index({ storyPage: 1, imageType: 1 });

module.exports = mongoose.model('Image', imageSchema);
