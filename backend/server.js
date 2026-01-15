// Load environment variables before importing app code
require('dotenv').config();

// Ensure Firebase Admin is initialized once at server startup
require('./src/config/firebaseAdmin');

const http = require("http");
const app = require('./src/app');
const connectDB = require('./src/config/database');
const ImageJob = require('./src/models/ImageJob');
const { runBookCreationJob } = require('./src/jobs/imageFunction');
const { initSocket } = require("./src/services/socket");

const PORT = process.env.PORT || 5000;


// Resume processing image jobs that were in 'processing' state before server restart
const resumeJobs = async () => {
  const jobs = await ImageJob.find({ status: "processing" });
  if (jobs.length === 0){
    console.log("✅ No processing jobs to resume.");
    return;
  } 
  console.log(`✔️ Resuming ${jobs.length} processing jobs...`);
  for (const job of jobs) {
    runBookCreationJob(job._id, {
      storyId: job.story,
      userId: job.user,
      title: null
    });
  }
};

// Connect to database
connectDB();
resumeJobs();

const server = http.createServer(app);
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
});


/* -------------------------------
      30 MIN SERVER TIMEOUT
--------------------------------*/
server.timeout = 1800000;            // 30 min
server.keepAliveTimeout = 1800000;   // 30 min
server.headersTimeout = 1800000;     // 30 min

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});




