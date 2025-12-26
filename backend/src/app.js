const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require("cookie-parser");


// Import routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/story');
const imageRoutes = require('./routes/image');
const coverRoutes = require('./routes/cover');
const addressRoutes = require('./routes/address');

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,   // Allow cross-site cookies
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({
  origin: "http://localhost:5173",
 // origin: "https://ghostverse.ai",
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/v1/', limiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/story', storyRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/cover', coverRoutes);
app.use('/api/address', addressRoutes);
  
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
