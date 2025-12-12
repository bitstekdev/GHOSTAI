const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  question: String,
  answer: String
}, { _id: false });

const characterDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });


const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    enum: ['Fantasy', 'Adventure', 'Family', 'Mystery', 'Housewarming', 
           'Corporate Promotion', 'Marriage', 'Baby Shower', 'Birthday', 'Sci-Fi', 'Friends']
  },
  numOfPages: {
    type: Number,
    required: true
  },
  step: {
    type: Number,
    required: true,
    default: 1
  },
  gist: {
    type: String,
    required: false
  },
  conversation: [conversationSchema],
  numCharacters: {
    type: Number,
    required: true
  },
  characterDetails: [characterDetailsSchema],
  orientation: {
    type: String,
    enum: ['Portrait', 'Landscape', 'Square'],
    default: 'Portrait'
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'failed'],
    default: 'draft'
  },
  coverImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },
  backCoverImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },
  backCoverBlurb: String,
  qrUrl: String,
  generationMetadata: {
    startedAt: Date,
    completedAt: Date,
    errorMessage: String
  }
}, {
  timestamps: true
});

// Index for faster queries
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ status: 1 });

module.exports = mongoose.model('Story', storySchema);