const transporter = require('../config/email');
const Story = require('../models/Story');
const Book = require('../models/Story'); 
require('dotenv').config();

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM || 'Ghostverse'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Ghostverse!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #9C27B0; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email - Ghostverse',
    html
  });
};

exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #9C27B0; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset - Ghostverse',
    html
  });
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Ghostverse! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Your email has been verified successfully!</p>
      <p>You can now start creating amazing storybooks with Ghostverse.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #9C27B0; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Get Started
        </a>
      </div>
      <hr style="border: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to Ghostverse!',
    html
  });
};

exports.sendStoryGeneratedEmail = async ({ user, story, pages }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Story Is Ready! 📖✨</h2>

      <p>Hi <strong>${user.name}</strong>,</p>

      <p>
        We’re excited to let you know that your story has been successfully generated!
      </p>

      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px;">
        <p><strong>Story Title:</strong> ${story.title || 'Untitled Story'}</p>
        <p><strong>Total Pages:</strong> ${pages.length}</p>
        <p><strong>Email:</strong> ${user.email}</p>
      </div>

      <p style="margin-top: 20px;">
        You can now explore your story page by page and bring it to life.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/stories/${story._id}"
           style="background-color: #9C27B0; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Your Story
        </a>
      </div>

      <hr style="border: 1px solid #eee; margin: 30px 0;" />

      <p style="color: #999; font-size: 12px;">
        This email was sent to <strong>${user.email}</strong><br />
        Ghostverse Team
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Your story "${story.title || 'Untitled'}" is ready! 📚`,
    html
  });
};