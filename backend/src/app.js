
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/story');
const imageRoutes = require('./routes/image');
const coverRoutes = require('./routes/cover');
const addressRoutes = require('./routes/address');
const pdfRoutes = require('./routes/pdf');
const subscriptionRoutes = require('./routes/subscription.routes');
const ordersROutes = require('./routes/orderRoute')


const orderRoutes = require("./routes/orderRoute");       // testing order !




const app = express();



/* ======================================================
SECURITY
====================================================== */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
  );
  
  app.use(
    cors({
      origin: ['http://localhost:5174', 'http://localhost:5173'],
      // origin: 'https://ghostverse.ai',
      credentials: true,
    })
    );
    
    /* ======================================================
    RATE LIMITING (NON-PDF)
    ====================================================== */
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    });
    
    app.use('/api/v1/', limiter);
    
    /* ======================================================
    BODY PARSERS
    ====================================================== */
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(cookieParser());
    
/* ======================================================
   HEALTH CHECK
====================================================== */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ======================================================
   API ROUTES
====================================================== */
app.use('/api/auth', authRoutes);
app.use('/api/v1/story', storyRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/cover', coverRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use("/api/v1/orders", ordersROutes);  // testing order !
app.use('/api/v1/pdf', pdfRoutes);


/* ======================================================
   PDF ROUTES (SPECIAL HANDLING)
====================================================== */
app.use(
  '/api/pdf',
  express.json({ limit: '50mb' }), // 🔥 critical
  (req, res, next) => {
    // Prevent compression / corruption
    res.setHeader('Content-Encoding', 'identity');
    next();
  }
);


/* ======================================================
   404
====================================================== */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ======================================================
   ERROR HANDLER (LAST)
====================================================== */
app.use(errorHandler);

module.exports = app;
