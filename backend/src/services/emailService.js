// services/email.js
const transporter = require('../config/email');
const EmailTemplate = require('../models/EmailTemplate');
const { renderTemplate } = require('../utils/renderTemplate');

/**
 * LOW-LEVEL EMAIL SENDER
 * Only responsible for sending email via Nodemailer
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `${process.env.EMAIL_FROM || 'Ghostverse'} <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

/**
 * CORE TEMPLATE EMAIL FUNCTION
 * 1. Fetches template from DB
 * 2. Injects variables into HTML
 * 3. Sends email
 */
const sendTemplateEmail = async (templateType, recipientEmail, variables) => {
  // Fetch template from MongoDB
  const template = await EmailTemplate.findOne({
    type: templateType,
    isActive: true
  });

  // Safety check
  if (!template) {
    throw new Error(`Email template not found: ${templateType}`);
  }

  // Replace placeholders with real values
  const finalHtml = renderTemplate(template.html, variables);

  // Send email
  await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    html: finalHtml
  });
};

/* ============================================================
   BUSINESS-Logic EMAIL FUNCTIONS
   ============================================================ */


 // Email verification
 
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendTemplateEmail(
    'VERIFY_EMAIL',
    user.email,
    {
      userName: user.name,
      verificationUrl
    }
  );
};


 // Password reset
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendTemplateEmail(
    'PASSWORD_RESET',
    user.email,
    {
      userName: user.name,
      resetUrl
    }
  );
};


  // Welcome email
 
exports.sendWelcomeEmail = async (user) => {
  await sendTemplateEmail(
    'WELCOME',
    user.email,
    {
      userName: user.name,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
    }
  );
};


 // Story generated email
 
exports.sendStoryGeneratedEmail = async ({ user, story, pages }) => {
  await sendTemplateEmail(
    'STORY_GENERATED',
    user.email,
    {
      userName: user.name,
      storyTitle: story.title || 'Untitled Story',
      pagesCount: pages.length,
      storyUrl: `${process.env.FRONTEND_URL}/stories/${story._id}`
    }
  );
};
