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


// START CRON JOBS (just import, no execution needed)
const { expireOutdatedSubscriptions } = require("./src/services/subscriptionExpiry.service");



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

// Connect to database and perform startup tasks
// On server startup, expire any outdated subscriptions that may have been missed during downtime
(async () => {
  try {
    // Connect DB
    await connectDB();

    //  RECOVER MISSED EXPIRATIONS
    const recovered =
      await expireOutdatedSubscriptions();

    if (recovered > 0) {
      console.log(
        ` Startup recovery: expired ${recovered} subscriptions`
      );
    }

    // Resume image jobs
    await resumeJobs();

    // Start cron jobs (daily checks)
    require("./src/cron/subscriptionExpiry.cron");

  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();


// Create HTTP server and initialize socket.io
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




