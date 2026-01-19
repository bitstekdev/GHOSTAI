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

  const currentSub = await UserSubscription.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: now }
  }).populate("plan");

  if (!currentSub) {
    throw new Error("No active subscription");
  }

  const newPlan = await SubscriptionPlan.findById(newPlanId);
  if (!newPlan || !newPlan.isActive) {
    throw new Error("Invalid plan");
  }

  const carriedCredits = {};
  const oldLimits = currentSub.plan.limits || {};

  Object.keys(oldLimits).forEach(key => {
    if (oldLimits[key] === null) {
      carriedCredits[key] = 0;
      return;
    }

    const used = currentSub.usage?.[key] || 0;
    const bonus = currentSub.bonusCredits?.[key] || 0;

    carriedCredits[key] = Math.max(
      oldLimits[key] + bonus - used,
      0
    );
  });

  const remainingMs = Math.max(currentSub.expiresAt - now, 0);
  const remainingDays = Math.ceil(remainingMs / 86400000);

  currentSub.status = "expired";
  await currentSub.save();

  return UserSubscription.create({
    user: userId,
    plan: newPlan._id,
    status: "active",
    usage: {},
    bonusCredits: carriedCredits,
    startedAt: now,
    expiresAt: new Date(
      now.getTime() + (remainingDays + newPlan.validityDays) * 86400000
    ),
    razorpay: razorpayDetails
  });
};
