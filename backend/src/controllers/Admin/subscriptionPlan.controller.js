const SubscriptionPlan = require("../../models/SubscriptionPlan");
const UserSubscription = require("../../models/UserSubscription");

// CREATE PLAN
exports.createPlan = async (req, res) => {
  try {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json({ success: true, plan, message: "Plan created successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// LIST PLANS (frontend filtered by context)
exports.getPlans = async (req, res) => {
  const { context } = req.query;

  try {
  const plans = await SubscriptionPlan.find()
    .sort({ displayOrder: 1 });

  res.json({ success: true, plans, message: "Plans retrieved successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// get getPlansByShowOnContext (user)
exports.getPlansByShowOnContext = async (req, res) => {
  const { context } = req.query;
  const filter = {
    isActive: true,
    isArchived: false,
    code: { $ne: "FREE-FOR-DEVELOPMENT-ONLY" }
  };
  if (context) {
    filter.$or = [
      { showOnContext: "all" },
      { showOnContext: context }
    ];
  }

  try {
    const plans = await SubscriptionPlan.find(filter)
      .sort({ displayOrder: 1 });

    res.json({ success: true, plans, message: "Plans retrieved successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// UPDATE PLAN
exports.updatePlan = async (req, res) => {
  try {
    const existingPlan = await SubscriptionPlan.findById(req.params.id);
    if(!existingPlan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
  );

  res.json({ success: true, plan, message: "Plan updated successfully", Plan: SubscriptionPlan });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// ARCHIVE PLAN
exports.archivePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);  
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }
  const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
    isArchived: true,
    isActive: false
  });
  res.json({ success: true, message: "Plan archived successfully", name: updatedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// UNARCHIVE PLAN
exports.unarchivePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Not Found" });
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
      isArchived: false,
      isActive: true
    });
    res.json({ success: true, message: "Plan unarchived successfully", name: updatedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};

// Delete PLAN permanently
exports.deletePlan = async (req, res) => {
  try{
    const plan = await SubscriptionPlan.findById(req.params.id);
    if(!plan){
      return  res.status(404).json({ success: false, message: "Plan Already Deleted" });
    }

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Plan deleted permanently", name: deletedPlan.name });
  } catch (error) {
    return res.status(400).json({ success: false, message: "something went wrong", error: error.message });
  }
};








/**
 * Assign FREE plan to user
 * - If user already has active plan → do nothing
 * - If expired / none → assign FREE
 */
exports.assignFreePlan = async (req, res) => {
  const { userId, key } = req.body;
  try {
  //  SECURITY CHECK: verify key
  if (key !== process.env.DEVELOPMENT_PLAN_FREE_ACCESS) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized to assign FREE plan"
    });
  }

  //  Check active subscription
  const activeSub = await UserSubscription.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: new Date() }
  });

  if (activeSub) {
    return res.status(203).json({
      success: true,
      message: "User already has an active subscription",
      subscriptionId: activeSub._id
    });
  }

  //  Find FREE plan
  const freePlan = await SubscriptionPlan.findOne({
    code: "FREE-FOR-DEVELOPMENT-ONLY",
  });

  if (!freePlan) {
    return res.status(500).json({
      success: false,
      message: "FREE DEVELOPER plan not configured"
    });
  }

  //  Expire any old subscriptions (safety)
  await UserSubscription.updateMany(
    {
      user: userId,
      status: { $in: ["pending", "expired"] }
    },
    { status: "expired" }
  );

  if (activeSub && activeSub.plan.price > 0) {
  return res.status(400).json({
    success: false,
    message: "Cannot downgrade active paid plan to FREE"
    });
  }


  //  Create FREE subscription
  const now = new Date();

  const freeSub = await UserSubscription.create({
    user: userId,
    plan: freePlan._id,
    status: "active",
    usage: {}, // unlimited → usage still tracked but not limited
    startedAt: now,
    expiresAt: new Date(
      now.getTime() + freePlan.validityDays * 24 * 60 * 60 * 1000
    )
  });

  return res.status(201).json({
    success: true,
    message: "FREE plan activated FOR DEVELOPMENT ONLY",
    subscriptionId: freeSub._id
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

/**
 * Admin assigns or upgrades a subscription without payment
 *
 * req.body:
 * {
 *   userId: "...",
 *   planId: "...",
 *   reason?: "manual grant | refund | goodwill | migration"
 * }
 */
exports.assignSubscription = async (req, res) => {
  const { userId, planId, reason = "admin-assigned", key } = req.body;

  //  SECURITY CHECK: verify key
  if (key !== process.env.DEVELOPMENT_PLAN_FREE_ACCESS) {
    return res.status(403).json({
      message: "Unauthorized to assign subscription"
    });
  }

  if (!userId || !planId) {
    return res.status(400).json({
      message: "userId and planId are required"
    });
  }

  //  Validate plan
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    return res.status(400).json({
      message: "Invalid or inactive plan"
    });
  }

  //  Check active subscription
  const activeSub = await UserSubscription.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: new Date() }
  });

  // UPGRADE FLOW (carry forward)
  if (activeSub) {
    const upgradedSub = await upgradeSubscription({
      userId,
      newPlanId: planId,
      razorpayDetails: {
        source: "admin",
        note: reason
      }
    });

    return res.json({
      success: true,
      action: "upgraded",
      subscriptionId: upgradedSub._id
    });
  }

  //  NEW ASSIGNMENT FLOW
  const now = new Date();

  const sub = await UserSubscription.create({
    user: userId,
    plan: plan._id,
    status: "active",
    usage: {
    maxPages: 0,
    maxBooks: 0,
    faceSwaps: 0,
    regenerations: 0,
    edits: 0,
    erases: 0
  },
  bonusCredits: {
    maxPages: 0,
    maxBooks: 0,
    faceSwaps: 0,
    regenerations: 0,
    edits: 0,
    erases: 0
  },
    startedAt: now,
    expiresAt: new Date(
      now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000
    ),
    razorpay: {
      source: "admin",
      note: reason
    }
  });

  return res.json({
    success: true,
    action: "assigned",
    subscriptionId: sub._id
  });
};