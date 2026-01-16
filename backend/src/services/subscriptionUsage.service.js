// exports.consumeUsage = async (subscription, key, count = 1) => {
//   const baseLimit = subscription.plan.limits[key] || 0;
//   const bonus = subscription.bonusCredits?.[key] || 0;
//   const used = subscription.usage[key] || 0;

//   const totalAllowed = baseLimit + bonus;

//   if (totalAllowed > 0 && used + count > totalAllowed) {
//     throw new Error(`Usage limit exceeded for ${key}`);
//   }

//   subscription.usage[key] = used + count;
//   await subscription.save();
// };


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
