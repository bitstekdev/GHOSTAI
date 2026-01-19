const UserSubscription = require("../models/UserSubscription");

exports.getSubscriptionStatus = async (req, res) => {
  const subscription = await UserSubscription.findOne({
    user: req.user.id,
    status: "active"
  }).populate("plan");

  if (!subscription) {
    return res.json({
      hasSubscription: false,
      expired: true
    });
  }

  const expired = subscription.expiresAt < new Date();
  const remaining = {};

  Object.keys(subscription.plan.limits).forEach(key => {
    remaining[key] =
      (subscription.plan.limits[key] || 0) +
      (subscription.bonusCredits?.[key] || 0) -
      (subscription.usage[key] || 0);
  });

  res.json({
    hasSubscription: true,
    expired,
    subscription: {
      id: subscription._id,
      planId: subscription.plan._id,
      planName: subscription.plan.name,
      code: subscription.plan.code,
      expiresAt: subscription.expiresAt,
      limits: subscription.plan.limits,
      usage: subscription.usage,
      bonusCredits: subscription.bonusCredits,
      remaining
    }
  });
};



exports.getActiveSubscription = async (req, res) => {
  const sub = await UserSubscription.findOne({
    user: req.user.id,
    status: "active",
    expiresAt: { $gt: new Date() }
  }).populate("plan");

  if (!sub) {
    return res.json({ active: false });
  }

  res.json({
    active: true,
    plan: {
      name: sub.plan.name,
      code: sub.plan.code,
      expiresAt: sub.expiresAt,
      isPopular: sub.plan.isPopular,
      badge: sub.plan.badge
    }
  });
};


exports.getPurchaseHistory = async (req, res) => {
  const history = await UserSubscription.find({
    user: req.user.id
  })
    .populate("plan")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    history: history.map(sub => ({
      id: sub._id,
      planName: sub.plan.name,
      code: sub.plan.code,
      price: sub.plan.price,
      status: sub.status,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      createdAt: sub.createdAt
    }))
  });
};



exports.getUsageLeft = async (req, res) => {
  const sub = await UserSubscription.findOne({
    user: req.user.id,
    status: "active",
    expiresAt: { $gt: new Date() }
  }).populate("plan");

  if (!sub) {
    return res.status(402).json({
      message: "No active subscription"
    });
  }

  const remaining = {};

  Object.keys(sub.plan.limits).forEach(key => {
    remaining[key] =
      (sub.plan.limits[key] || 0) +
      (sub.bonusCredits?.[key] || 0) -
      (sub.usage[key] || 0);
  });

  res.json({
    remaining,
    expiresAt: sub.expiresAt
  });
};



exports.getAllUserSubscriptions = async (req, res) => {
  
   const subs = await UserSubscription.find(filter)
    .populate("plan")
    .populate("user", "name email");

  res.json({ success: true, subscriptions: subs });
};




