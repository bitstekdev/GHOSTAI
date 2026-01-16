const UserSubscription = require("../models/UserSubscription");

exports.requireActiveSubscription = async (req, res, next) => {
  const subscription = await UserSubscription.findOne({
    user: req.user.id,
    status: "active",
    expiresAt: { $gt: new Date() }
  }).populate("plan");

  if (!subscription) {
    return res.status(402).json({
      message: "Active subscription required"
    });
  }

  req.subscription = subscription;
  next();
};
