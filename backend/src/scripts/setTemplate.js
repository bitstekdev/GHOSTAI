// scripts/setTemplate.js

const mongoose = require('mongoose');
const EmailTemplate = require('../models/EmailTemplate');

/**
 * UPSERT EMAIL TEMPLATE
 * If template exists → update
 * If not → create
 */
const setTemplate = async ({ type, subject, html }) => {
  await EmailTemplate.findOneAndUpdate(
    { type },
    { subject, html, isActive: true },
    { upsert: true, new: true }
  );

  console.log(`Template set: ${type}`);
};


 // MAIN FUNCTION to set all templates
 
const run = async () => {


  /* ================= VERIFY EMAIL ================= */
  await setTemplate({
    type: 'VERIFY_EMAIL',
    subject: 'Verify Your Email - Ghostverse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Ghostverse!</h2>
        <p>Hi {{userName}},</p>
        <p>Thank you for signing up. Please verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}"
             style="background-color: #9C27B0; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p>If you didn’t create an account, ignore this email.</p>
        <p style="font-size: 12px; color: #999;">Ghostverse Team</p>
      </div>
    `
  });

  /* ================= PASSWORD RESET ================= */
  await setTemplate({
    type: 'PASSWORD_RESET',
    subject: 'Password Reset - Ghostverse',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Password Reset</h2>
        <p>Hi {{userName}},</p>
        <p>Click the button below to reset your password:</p>
        <a href="{{resetUrl}}"
           style="background:#9C27B0;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      </div>
    `
  });

  /* ================= WELCOME EMAIL ================= */
  await setTemplate({
    type: 'WELCOME',
    subject: 'Welcome to Ghostverse!',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Welcome 🎉✨</h2>
        <p>Hi {{userName}},</p>
        <p>Your email has been verified successfully.</p>
        <a href="{{dashboardUrl}}">Go to Dashboard</a>
      </div>
    `
  });

  /* ================= STORY GENERATED ================= */
  await setTemplate({
    type: 'STORY_GENERATED',
    subject: 'Your story "{{storyTitle}}" is ready!',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Your Story Is Ready! ✨</h2>
        <p>Hi {{userName}},</p>
        <p><strong>Title:</strong> {{storyTitle}}</p>
        <p><strong>Total Pages:</strong> {{pagesCount}}</p>
        <a href="{{storyUrl}}"
           style="background:#9C27B0;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:5px;">
          View Story
        </a>
      </div>
    `
  });

  console.log('~ All email templates set successfully ~');
  process.exit();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
