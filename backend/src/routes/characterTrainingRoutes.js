const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const characterTrainingController = require("../controllers/characterTrainingController");

// Upload to memory (will be streamed to FastAPI)
const upload = multer({ storage: multer.memoryStorage() });

// Start character training
router.post("/train", protect, upload.array("files", 20), characterTrainingController.startTraining);

// Generate images using trained LoRA
router.post("/generate-images", protect, characterTrainingController.generateImages);

// Get job status
router.get("/status/:jobId", protect, characterTrainingController.getJobStatus);

// List all training jobs for user
router.get("/jobs", protect, characterTrainingController.listJobs);

module.exports = router;
