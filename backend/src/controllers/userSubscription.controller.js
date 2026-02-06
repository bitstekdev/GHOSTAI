const UserSubscription = require("../models/UserSubscription");

exports.getSubscriptionStatus = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveSubscription = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsageLeft = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({
      user: req.user.id,
      status: "active",
      expiresAt: { $gt: new Date() }
    }).populate("plan");

    if (!sub) {
      return res.status(202).json({
        message: "No active subscription"
      });
    }

    const limits = sub.plan.limits?.toObject
      ? sub.plan.limits.toObject()
      : sub.plan.limits;

    if (!limits) {
      return res.json({
        unlimited: true,
        credits: null,
        expiresAt: sub.expiresAt
      });
    }

    const usage = sub.usage || {};
    const bonus = sub.bonusCredits || {};
    const remaining = {};

    let credits = 0;

    Object.keys(limits).forEach(key => {
      if (limits[key] === null) {
        remaining[key] = null;
        return;
      }

      const left = Math.max(
        limits[key] + (bonus[key] || 0) - (usage[key] || 0),
        0
      );

      remaining[key] = left;
      credits += left;
    });

    res.json({
      unlimited: false,
      credits,
      remaining,
      used: usage,
      bonus,
      expiresAt: sub.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find(filter)
      .populate("plan")
      .populate("user", "name email");

    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
