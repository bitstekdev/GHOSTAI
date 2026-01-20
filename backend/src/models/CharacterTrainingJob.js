const mongoose = require("mongoose");

const characterTrainingJobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued" },
  stage: String,
  progress: Number,
  triggerWord: String,
  loraPath: String,
  runpodJobId: String,
  runpodStatus: String,
  error: String,
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("CharacterTrainingJob", characterTrainingJobSchema);
