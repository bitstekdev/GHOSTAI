const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  isLoggedIn,
  refreshToken,
  logout,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { completeOnboardingTour } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateSignup,
  validateLogin,
  validateChangePassword
} = require('../middleware/validation');

// routes===========================
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, validateChangePassword, changePassword);
router.get("/is-logged-in", isLoggedIn);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.patch('/onboarding-tour', protect, completeOnboardingTour);


module.exports = router;
