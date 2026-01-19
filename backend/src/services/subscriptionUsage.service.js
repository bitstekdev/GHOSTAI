const UserSubscription = require("../models/UserSubscription");

exports.consumeUsage = async (subscription, key, count = 1) => {
  const baseLimit = subscription.plan.limits[key];
  const bonus = subscription.bonusCredits?.[key] || 0;
  const used = subscription.usage[key] || 0;

  // Unlimited access
  if (baseLimit === null) {
    return;
  }

  const totalAllowed = baseLimit + bonus;

  if (totalAllowed > 0 && used + count > totalAllowed) {
    throw new Error(`Usage limit exceeded for ${key}`);
  }

  subscription.usage[key] = used + count;
  await subscription.save();
};


exports.getActiveSubscriptionOrFail = async (userId) => {
  const sub = await UserSubscription.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: new Date() }
  }).populate("plan");

  if (!sub) {
    throw new Error("No active subscription");
  }

  return sub;
};

