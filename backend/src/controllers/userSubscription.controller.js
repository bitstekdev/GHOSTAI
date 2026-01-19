const UserSubscription = require("../models/UserSubscription");

exports.getSubscriptionStatus = async (req, res) => {
  const sub = await UserSubscription.findOne({
    user: req.user.id,
    status: "active"
  });

  if (!sub) {
    return res.json({
      hasSubscription: false,
      expired: true
    });
  }

  const expired = sub.expiresAt <= new Date();

  res.json({
    hasSubscription: true,
    expired,
    expiresAt: sub.expiresAt
  });
};




exports.getActiveSubscription = async (req, res) => {
  const sub = await UserSubscription.findOne({
    user: req.user.id,
    status: "active",
    expiresAt: { $gt: new Date() }
  }).populate("plan");

  if (!sub) {
    return res.json({
      active: false,
      message: "No active subscription"
    });
  }

  res.json({
    active: true,
    subscription: {
      id: sub._id,
      planId: sub.plan._id,
      name: sub.plan.name,
      code: sub.plan.code,
      price: sub.plan.price,
      badge: sub.plan.badge,
      isPopular: sub.plan.isPopular,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      validityDays: sub.plan.validityDays
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
    return res.status(403).json({
      message: "No active subscription"
    });
  }

  // Convert Mongoose subdoc → plain object
  const limits = sub.plan.limits?.toObject
    ? sub.plan.limits.toObject()
    : sub.plan.limits;

  // Unlimited plan
  if (!limits) {
    return res.json({
      unlimited: true,
      expiresAt: sub.expiresAt
    });
  }

  const usage = sub.usage || {};
  const bonus = sub.bonusCredits || {};
  const remaining = {};

  Object.keys(limits).forEach(key => {
    if (limits[key] === null) {
      remaining[key] = null; // unlimited feature
      return;
    }

    remaining[key] = Math.max(
      limits[key] + (bonus[key] || 0) - (usage[key] || 0),
      0
    );
  });

  res.json({
    unlimited: false,
    remaining,
    used: usage,
    bonus,
    expiresAt: sub.expiresAt
  });
};





exports.getAllUserSubscriptions = async (req, res) => {
  
   const subs = await UserSubscription.find(filter)
    .populate("plan")
    .populate("user", "name email");

  res.json({ success: true, subscriptions: subs });
};




