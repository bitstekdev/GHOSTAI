const mongoose = require('mongoose');

const storyPageSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  sdxlPrompt: String,
  characterImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },
  backgroundImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },
  finalCompositeImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
storyPageSchema.index({ story: 1, pageNumber: 1 }, { unique: true });

module.exports = mongoose.model('StoryPage', storyPageSchema);