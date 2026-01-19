const UserSubscription = require("../models/UserSubscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

/**
 * Upgrade subscription
 *
 * Rules:
 * - Carry forward ONLY unused credits from old subscription
 * - New plan limits come from SubscriptionPlan.limits
 * - bonusCredits stores ONLY carried-forward credits
 * - usage resets to 0
 * - validity is extended (remaining + new plan validity)
 */
exports.upgradeSubscription = async ({
  userId,
  newPlanId,
  razorpayDetails = {}
}) => {
  const now = new Date();

  // 1️⃣ Get current active subscription
  const currentSub = await UserSubscription.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: now }
  }).populate("plan");

  if (!currentSub) {
    throw new Error("No active subscription to upgrade");
  }

  // 2️⃣ Get new plan
  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan || !newPlan.isActive) {
    throw new Error("Invalid upgrade plan");
  }

  // 3️⃣ Calculate carried-forward credits (ONLY unused credits)
  const carriedCredits = {};

  Object.keys(currentSub.plan.limits).forEach(key => {
    const baseLimit = currentSub.plan.limits[key] || 0;
    const bonus = currentSub.bonusCredits?.[key] || 0;
    const used = currentSub.usage?.[key] || 0;

    carriedCredits[key] = Math.max(
      baseLimit + bonus - used,
      0
    );
  });

  // 4️⃣ Calculate remaining validity days
  const remainingMs = Math.max(currentSub.expiresAt - now, 0);
  const remainingDays = Math.ceil(
    remainingMs / (24 * 60 * 60 * 1000)
  );

  const totalValidityDays =
    remainingDays + (newPlan.validityDays || 0);

  // 5️⃣ Expire old subscription
  currentSub.status = "expired";
  await currentSub.save();

  // 6️⃣ Create upgraded subscription
  const upgradedSub = await UserSubscription.create({
    user: userId,
    plan: newPlan._id,

    status: "active",

    // usage resets
    usage: {
      maxPages: 0,
      maxBooks: 0,
      faceSwaps: 0,
      regenerations: 0,
      edits: 0,
      erases: 0
    },

    // carry-forward credits ONLY
    bonusCredits: carriedCredits,

    startedAt: now,
    expiresAt: new Date(
      now.getTime() + totalValidityDays * 24 * 60 * 60 * 1000
    ),

    razorpay: razorpayDetails
  });

  return upgradedSub;
};
