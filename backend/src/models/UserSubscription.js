const mongoose = require("mongoose");

/**
 * Tracks how much user has USED
 */
const usageSchema = new mongoose.Schema(
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

/**
 * Tracks EXTRA credits added via upgrade / promo / admin
 */
const bonusCreditsSchema = new mongoose.Schema(
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

const userSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "failed", "cancelled"],
      default: "pending",
      index: true
    },

    /**
     * How much the user has CONSUMED
     */
    usage: usageSchema,

    /**
     * Extra credits added on upgrade
     * (carry-forward credits live here)
     */
    bonusCredits: bonusCreditsSchema,

    startedAt: Date,
    expiresAt: Date
  },
  { timestamps: true }
);

/**
 * Helpful compound index
 */
userSubscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);
