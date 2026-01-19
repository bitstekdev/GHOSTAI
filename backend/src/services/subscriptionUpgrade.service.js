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
  try {
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

    const EMPTY_CREDITS = {
  maxPages: 0,
  maxBooks: 0,
  faceSwaps: 0,
  regenerations: 0,
  edits: 0,
  characterTraining: 0
};

const oldLimits = currentSub.plan?.limits ?? EMPTY_CREDITS;
const newLimits = newPlan.limits ?? EMPTY_CREDITS;


    /**
     * Carry forward ONLY keys that exist in NEW plan
     */
  const carriedCredits = {};

Object.keys(EMPTY_CREDITS).forEach(key => {
  // Unlimited feature
  if (newLimits[key] === null) {
    carriedCredits[key] = 0;
    return;
  }

  const oldLimit = Number(oldLimits[key] ?? 0);
  const used = Number(currentSub.usage?.[key] ?? 0);
  const bonus = Number(currentSub.bonusCredits?.[key] ?? 0);

  const remaining = oldLimit + bonus - used;

  carriedCredits[key] = Number.isFinite(remaining)
    ? Math.max(remaining, 0)
    : 0;
});

    // Remaining validity
    const remainingMs = Math.max(currentSub.expiresAt - now, 0);
    const remainingDays = Math.ceil(remainingMs / 86400000);

    // Expire old subscription
    currentSub.status = "expired";
    await currentSub.save();

    // Create new upgraded subscription
    const emptyCredits = {
      maxPages: 0,
      maxBooks: 0,
      faceSwaps: 0,
      regenerations: 0,
      edits: 0,
      characterTraining: 0
    };

return UserSubscription.create({
  user: userId,
  plan: newPlan._id,
  status: "active",

  usage: { ...EMPTY_CREDITS },

  bonusCredits: {
    ...EMPTY_CREDITS,
    ...carriedCredits
  },

  startedAt: now,
  expiresAt: new Date(
    now.getTime() +
      (remainingDays + newPlan.validityDays) * 86400000
  ),

  razorpay: razorpayDetails
});

  } catch (error) {
    throw new Error(`Subscription upgrade failed: ${error.message}`);
  }
};
