const mongoose = require("mongoose");

const imageJobSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["queued", "processing", "completed", "failed"],
    default: "queued"
  },

  step: {
    type: String,
    enum: ["characters", "backgrounds", "cover", "done"],
    default: "characters"
  },

  progress: {
    type: Number,
    default: 0 // 0–100
  },

  error: String,

  startedAt: Date,
  completedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("ImageJob", imageJobSchema);
