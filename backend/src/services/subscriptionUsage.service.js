const UserSubscription = require("../models/UserSubscription");

exports.consumeUsage = async (subscription, key, count = 1) => {
  console.log("Consuming usage:", key, count);

  // Ensure objects exist
  subscription.usage = subscription.usage || {};
  subscription.bonusCredits = subscription.bonusCredits || {};

  const limits = subscription.plan?.limits;

  // Unlimited plan or unlimited feature
  if (!limits || limits[key] === null) return;

  const used = subscription.usage[key] || 0;
  const bonus = subscription.bonusCredits[key] || 0;
  const totalAllowed = limits[key] + bonus;

  if (used + count > totalAllowed) {
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
    const err = new Error("No active subscription");
    err.statusCode = 403;
    throw err;
  }

  return sub;
};




exports.assertCanConsume = (subscription, key, count = 1) => {
  subscription.usage = subscription.usage || {};
  subscription.bonusCredits = subscription.bonusCredits || {};

  const limits = subscription.plan?.limits;

  if (!limits || limits[key] === null) return true;

  const used = subscription.usage[key] || 0;
  const bonus = subscription.bonusCredits[key] || 0;

  if (limits[key] + bonus - used < count) {
    throw new Error(`Insufficient ${key}`);
  }

  return true;
};



