const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');
const {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyRefreshToken,
  verifyEmailToken
} = require('../utils/tokenUtils');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../services/emailService');
require('dotenv').config();

const COOKIE_OPTS = {
  httpOnly: true,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
};


// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate email verification token
    const emailToken = generateEmailToken(user._id);
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, emailToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify and log in to your account.',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        onboardingTourCompleted: user.onboardingTourCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // console.log("user found:", user.email);

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    // console.log("ispassword match:", isPasswordMatch);
    if (!isPasswordMatch) {
      // console.log("password mismatch");
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    // console.log("password matched");

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresEmailVerification: true
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    user.lastLogin = Date.now();
    await user.save();

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });

    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          onboardingTourCompleted: user.onboardingTourCompleted,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = verifyEmailToken(token);
    
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("verify email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new token
    const emailToken = generateEmailToken(user._id);
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send email
    await sendVerificationEmail(user, emailToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Check if user is logged in
// @route   GET /api/auth/is-logged-in
// @access  Public (but checks access token)
exports.isLoggedIn = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.json({ loggedIn: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) return res.json({ loggedIn: false });


    return res.json({
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingTourCompleted: user.onboardingTourCompleted
      },
    });

  } catch (err) {
    return res.json({ loggedIn: false });
  }
};




// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  
  try {
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token missing"
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const tokenExists = user.refreshTokens.find(
      rt => rt.token === refreshToken && rt.expiresAt > Date.now()
    );

    if (!tokenExists) {
      console.log("Expired refresh token:", refreshToken);
      return res.status(401).json({
        success: false,
        message: "Expired refresh token"
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    console.log("Error refreshing token:", error);
    next(error);
  }
};




// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findById(req.user.id);

    // Remove refresh token
    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      await user.save();
    }

    // Clear cookies with same options as when they were set
    res.clearCookie('accessToken', COOKIE_OPTS);
    res.clearCookie('refreshToken', COOKIE_OPTS);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email phone role isEmailVerified onboardingTourCompleted createdAt');

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        onboardingTourCompleted: user.onboardingTourCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark onboarding tour completion
// @route   PATCH /api/auth/onboarding-tour
// @access  Private
exports.completeOnboardingTour = async (req, res, next) => {
  try {
    const { completed = true } = req.body;
    const user = await User.findById(req.user.id).select('onboardingTourCompleted');

    user.onboardingTourCompleted = Boolean(completed);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding tour status updated',
      data: { onboardingTourCompleted: user.onboardingTourCompleted }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user.id).select('name email phone');

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Google Sign-In
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token missing' });
    }

    if (!admin || !admin.auth) {
      console.error('Firebase Admin not initialized. Make sure env vars are set.');
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    // 1. Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const email = decoded.email;
    const name = decoded.name || 'Google User';

    // 2. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        isEmailVerified: true,
      });
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    user.lastLogin = Date.now();
    await user.save();

    // 4. Set cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });

    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingTourCompleted: user.onboardingTourCompleted,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};