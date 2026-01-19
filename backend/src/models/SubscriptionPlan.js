const mongoose = require("mongoose");

const planLimitsSchema = new mongoose.Schema(
  {
    maxPages: { type: Number, default: 0 },
    maxBooks: { type: Number, default: 0 },
    faceSwaps: { type: Number, default: 0 },
    regenerations: { type: Number, default: 0 },
    edits: { type: Number, default: 0 },
    erases: { type: Number, default: 0 }
  },
  { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    description: String,

    type: {
      type: String,
      enum: ["subscription", "purchase"],
      default: "subscription"
    },

    limits: planLimitsSchema,

    printType: {
      type: String,
      enum: ["softcover", "hardcover", "both"],
      // default: "softcover"
    },

    printSubType: {
        type: String,
        enum: ["Spark", "Bloom", "Wander", "Heirloom", "Legacy", "Heritage" ],
        // default: "Spark"
    },

    displayOrder: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    badge: { type: String, trim: true },

    showOnContext: {
      type: [String],
      enum: ["initial", "purchase", "generate", "upgrade", "all"],
      default: ["all"]
    },

    validityDays: {
      type: Number,
      default: 30
    },

    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
