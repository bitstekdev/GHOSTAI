const UserSubscription = require("../models/UserSubscription");

/**
 * Expire all subscriptions that passed expiresAt
 * Safe to run multiple times
 */
exports.expireOutdatedSubscriptions = async () => {
  const now = new Date();

  const result = await UserSubscription.updateMany(
    {
      status: "active",
      expiresAt: { $lte: now }
    },
    {
      $set: { status: "expired" }
    }
  );
  console.log(`✅ Checked for outdated subscriptions at ${now.toISOString()}`);
  return result.modifiedCount || 0;
};
