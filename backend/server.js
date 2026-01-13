// Load environment variables before importing app code
require('dotenv').config();

// Ensure Firebase Admin is initialized once at server startup
require('./src/config/firebaseAdmin');

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
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
