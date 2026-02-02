// models/EmailTemplate.js
const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    // Unique identifier for each email type
    // Example: VERIFY_EMAIL, PASSWORD_RESET, STORY_GENERATED
    type: {
      type: String,
      required: true,
      unique: true
    },

    // Email subject (editable from DB)
    subject: {
      type: String,
      required: true
    },

    // FULL HTML EMAIL TEMPLATE
    // it contains placeholders like {{userName}} {{verificationUrl}}
    html: {
      type: String,
      required: true
    },

    // We can disable email without changing code 
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
