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
      expiresAt: { $ne: null, $lte: now }
    },
    {
      $set: {
        status: "expired",
        updatedAt: now
      }
    }
  );

  console.log(
    `Expired ${result.modifiedCount || 0} subscriptions at ${now.toISOString()}`
  );

  return result.modifiedCount || 0;
};


