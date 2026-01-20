const CharacterTrainingJob = require("../models/CharacterTrainingJob");
const TrainedCharacter = require("../models/TrainedCharacter");
const Story = require("../models/Story");
const { runCharacterTrainingJob } = require("../jobs/characterTrainingJob");
const fastApiService = require("../services/fastApiService");

exports.startTraining = async (req, res) => {
  try {
    const { triggerWord } = req.body;

    if (!triggerWord || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Trigger word and images required" });
    }

    console.log("🟡 Creating character training job...");
    const job = await CharacterTrainingJob.create({
      user: req.user._id,
      triggerWord: triggerWord,
      progress: 0,
      stage: "queued"
    });

    // Run job asynchronously
    process.nextTick(() => {
      runCharacterTrainingJob(job._id, {
        userId: req.user._id,
        triggerWord: triggerWord,
        files: req.files
      });
    });

    res.json({ success: true, jobId: job._id });
  } catch (err) {
    console.error("❌ Start training error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.generateImages = async (req, res) => {
  try {
    const { jobId, pages, orientation, loraStrength } = req.body;

    const job = await CharacterTrainingJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Training job not found" });
    }

    if (job.status !== "completed") {
      return res.status(400).json({ message: "Training not completed" });
    }

    console.log("🟡 Generating LoRA images...");
    const result = await fastApiService.generateLoRAImages({
      userId: req.user._id,
      triggerWord: job.triggerWord,
      pages: pages,
      orientation: orientation,
      loraStrength: loraStrength || 1.0
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Generate images error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await CharacterTrainingJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      success: true,
      job: {
        _id: job._id,
        status: job.status,
        stage: job.stage,
        progress: job.progress,
        triggerWord: job.triggerWord,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }
    });
  } catch (err) {
    console.error("❌ Get job status error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const jobs = await CharacterTrainingJob.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        _id: job._id,
        status: job.status,
        stage: job.stage,
        progress: job.progress,
        triggerWord: job.triggerWord,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }))
    });
  } catch (err) {
    console.error("❌ List jobs error:", err);
    res.status(500).json({ message: err.message });
  }
};


