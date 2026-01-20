// const transporter = require('../config/email');
// require('dotenv').config();

// const sendEmail = async (options) => {
//   const mailOptions = {
//     from: `${process.env.EMAIL_FROM || 'Ghostverse'} <${process.env.EMAIL_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     html: options.html
//   };

//   await transporter.sendMail(mailOptions);
// };

// exports.sendVerificationEmail = async (user, token) => {
//   const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #333;">Welcome to Ghostverse!</h2>
//       <p>Hi ${user.name},</p>
//       <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${verificationUrl}" 
//            style="background-color: #9C27B0; color: white; padding: 12px 30px; 
//                   text-decoration: none; border-radius: 5px; display: inline-block;">
//           Verify Email
//         </a>
//       </div>
//       <p>Or copy and paste this link in your browser:</p>
//       <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
//       <p>This link will expire in 24 hours.</p>
//       <p>If you didn't create an account, please ignore this email.</p>
//       <hr style="border: 1px solid #eee; margin: 30px 0;">
//       <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
//     </div>
//   `;

//   await sendEmail({
//     email: user.email,
//     subject: 'Verify Your Email - Ghostverse',
//     html
//   });
// };

// exports.sendPasswordResetEmail = async (user, token) => {
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #333;">Password Reset Request</h2>
//       <p>Hi ${user.name},</p>
//       <p>You requested to reset your password. Click the button below to proceed:</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${resetUrl}" 
//            style="background-color: #9C27B0; color: white; padding: 12px 30px; 
//                   text-decoration: none; border-radius: 5px; display: inline-block;">
//           Reset Password
//         </a>
//       </div>
//       <p>Or copy and paste this link in your browser:</p>
//       <p style="color: #666; word-break: break-all;">${resetUrl}</p>
//       <p>This link will expire in 1 hour.</p>
//       <p>If you didn't request a password reset, please ignore this email.</p>
//       <hr style="border: 1px solid #eee; margin: 30px 0;">
//       <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
//     </div>
//   `;

//   await sendEmail({
//     email: user.email,
//     subject: 'Password Reset - Ghostverse',
//     html
//   });
// };

// exports.sendWelcomeEmail = async (user) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #333;">Welcome to Ghostverse! 🎉</h2>
//       <p>Hi ${user.name},</p>
//       <p>Your email has been verified successfully!</p>
//       <p>You can now start creating amazing storybooks with Ghostverse.</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${process.env.FRONTEND_URL}/dashboard" 
//            style="background-color: #9C27B0; color: white; padding: 12px 30px; 
//                   text-decoration: none; border-radius: 5px; display: inline-block;">
//           Get Started
//         </a>
//       </div>
//       <hr style="border: 1px solid #eee; margin: 30px 0;">
//       <p style="color: #999; font-size: 12px;">Ghostverse Team</p>
//     </div>
//   `;

//   await sendEmail({
//     email: user.email,
//     subject: 'Welcome to Ghostverse!',
//     html
//   });
// };

const transporter = require('../config/email');
require('dotenv').config();

// Helper to get the correct frontend URL based on request origin
const getFrontendUrl = (req) => {
  const allowed = process.env.FRONTEND_URL.split(",").map(u => u.trim());
  const origin = req.headers.origin;
  return allowed.includes(origin) ? origin : allowed[0];
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM || 'Ghostverse'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

exports.sendVerificationEmail = async (user, token, req) => {
  const frontend = getFrontendUrl(req);
  const verificationUrl = `${frontend}/verify-email?token=${token}`;

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

exports.sendPasswordResetEmail = async (user, token, req) => {
  const frontend = getFrontendUrl(req);
  const resetUrl = `${frontend}/reset-password?token=${token}`;

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
        <a href="${process.env.FRONTEND_URL.split(",")[0]}/dashboard" 
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