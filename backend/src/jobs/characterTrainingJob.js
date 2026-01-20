const CharacterTrainingJob = require("../models/CharacterTrainingJob");
const TrainedCharacter = require("../models/TrainedCharacter");
const fastApiService = require("../services/fastApiService");
const User = require("../models/User");
const { emitJobUpdate } = require("../services/socket");
// const { finalizeTraining } = require("../controllers/characterTrainingController");


exports.runCharacterTrainingJob = async (jobId, payload) => {
  try {
    await CharacterTrainingJob.findByIdAndUpdate(jobId, { status: "processing", stage: "uploading", progress: 5, startedAt: new Date() });
    emitJobUpdate(jobId, { stage: "uploading", progress: 5 });

    console.log("🟡 Uploading and processing character images...");
    await fastApiService.uploadAndProcessCharacter(payload.userId, payload.files);

    await CharacterTrainingJob.findByIdAndUpdate(jobId, { stage: "captioning", progress: 35 });
    emitJobUpdate(jobId, { stage: "captioning", progress: 35 });

    // Skip captions — LoRA is already trained
    console.log("LoRA training finished. Skipping caption generation.");

    await CharacterTrainingJob.findByIdAndUpdate(jobId, { stage: "training", progress: 65 });
    emitJobUpdate(jobId, { stage: "training", progress: 65 });

    console.log("🟡 Training LoRA model...");
    const train = await fastApiService.trainCharacterLoRA(payload.userId, payload.triggerWord);
    const runpodJobId = train.runpod_job.id;

    await CharacterTrainingJob.findByIdAndUpdate(jobId, {
      runpodJobId,
      runpodStatus: "IN_QUEUE"
    });
    emitJobUpdate(jobId, { stage: "training", progress: 65, runpodStatus: "IN_QUEUE" });

    // Poll RunPod for training completion
    console.log("🟡 Polling RunPod job status...");
    let completed = false;
    let pollCount = 0;
    const maxPolls = 240; // 1 hour with 15-second intervals

    while (!completed && pollCount < maxPolls) {
      await new Promise(r => setTimeout(r, 15000)); // 15-second interval
      pollCount++;

      try {
        const status = await fastApiService.getTrainingStatus(runpodJobId);
        
        await CharacterTrainingJob.findByIdAndUpdate(jobId, {
          runpodStatus: status.status,
          progress: status.progress || 65
        });
        emitJobUpdate(jobId, {
          stage: "training",
          progress: status.progress || 65,
          runpodStatus: status.status
        });

        if (status.status === "COMPLETED") {
          completed = true;
          console.log("🟢 RunPod training completed");
          // await finalizeTraining(jobId);
        } else if (status.status === "FAILED") {
          throw new Error(`RunPod training failed: ${status.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("❌ Error polling RunPod status:", err.message);
        throw err;
      }
    }

    if (!completed) {
      throw new Error("Training timeout: RunPod job did not complete within 1 hour");
    }

    await CharacterTrainingJob.findByIdAndUpdate(jobId, {
      status: "completed",
      stage: "done",
      progress: 100,
      runpodStatus: "COMPLETED",
      loraPath: train.lora_path,
      completedAt: new Date()
    });
    emitJobUpdate(jobId, { stage: "done", progress: 100 });
    const updateUser = await User.findOneAndUpdate(
      { "_id": payload.userId },
      { $set: { "mainCharacter.loraPath": train.lora_path } },
      { new: true }
    );
    
    // Finalize training and create TrainedCharacter entry
    await finalizeTraining(jobId);
    
    console.log("🟢 Character training completed:", jobId);
  } catch (err) {
    console.error("❌ Character training failed:", err);
    await CharacterTrainingJob.findByIdAndUpdate(jobId, { status: "failed", error: err.message });
    emitJobUpdate(jobId, { status: "failed", error: err.message });
  }
};


// Finalize training and create TrainedCharacter entry--------------------------------------
const finalizeTraining = async (jobId) => {
  const job = await CharacterTrainingJob.findById(jobId);
  if (!job) throw new Error("Training job not found");

  const trainedCharacter = await TrainedCharacter.create({
    user: job.user,
    name: job.triggerWord.charAt(0).toUpperCase() + job.triggerWord.slice(1),
    triggerWord: job.triggerWord,
    jobId,
    loraPath: `s3://models/loras/${job.user}/${job.user}.safetensors`,
    status: "ready"
  });

  if (job.user) {
    await User.findByIdAndUpdate(job.user, {
      $addToSet: { trainedCharacters: trainedCharacter._id }
    });
  }

  return trainedCharacter;
};