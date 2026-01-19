const transporter = require('../config/email');
const EmailTemplate = require('../models/EmailTemplate');
const { renderTemplate } = require('../utils/renderTemplate');

// Helper to get the correct frontend URL based on request origin
const getFrontendUrl = (req) => {
  const allowed = process.env.FRONTEND_URL.split(",").map(u => u.trim());
  const origin = req.headers.origin;
  return allowed.includes(origin) ? origin : allowed[0];
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM || 'Ghostverse'} <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
};

exports.sendVerificationEmail = async (user, token, req) => {
  const frontend = getFrontendUrl(req);
  const verificationUrl = `${frontend}/verify-email?token=${token}`;

  await sendTemplateEmail(
    'VERIFY_EMAIL',
    user.email,
    {
      userName: user.name,
      verificationUrl
    }
  );
};

exports.sendPasswordResetEmail = async (user, token, req) => {
  const frontend = getFrontendUrl(req);
  const resetUrl = `${frontend}/reset-password?token=${token}`;

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
