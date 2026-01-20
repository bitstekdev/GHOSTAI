const mongoose = require("mongoose");

const trainedCharacterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },        // Emma
  triggerWord: { type: String, required: true }, // emma
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "CharacterTrainingJob" },
  status: { type: String, enum: ["training", "ready", "failed"], default: "training" },
  loraPath: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("TrainedCharacter", trainedCharacterSchema);
