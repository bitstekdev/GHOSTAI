const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const UserSubscription = require("../models/UserSubscription");
const { upgradeSubscription } = require("../services/subscriptionUpgrade.service");



// CREATE ORDER
exports.createOrder = async (req, res) => {
  const { planId, isUpgrade = false } = req.body;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  // Safety: upgrade requires existing active subscription
  if (isUpgrade) {
    const activeSub = await UserSubscription.findOne({
      user: req.user.id,
      status: "active",
      expiresAt: { $gt: new Date() }
    });

    if (!activeSub) {
      return res.status(400).json({
        message: "No active subscription to upgrade"
      });
    }
  }

  const order = await razorpay.orders.create({
    amount: plan.price * 100,
    currency: plan.currency,
    receipt: `sub_${Date.now()}`
  });

  const sub = await UserSubscription.create({
    user: req.user.id,
    plan: plan._id,
    status: "pending",
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
    razorpay: { orderId: order.id }
  });

  res.json({
    success: true,
    order,
    subscriptionId: sub._id
  });
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  const {
    orderId,
    paymentId,
    signature,
    subscriptionId,
    planId,
    isUpgrade = false
  } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  // UPGRADE FLOW
  if (isUpgrade) {
    await upgradeSubscription({
      userId: req.user.id,
      newPlanId: planId,
      razorpayDetails: { orderId, paymentId, signature }
    });

    return res.json({ success: true, upgraded: true });
  }

  // NORMAL PURCHASE FLOW
  const sub = await UserSubscription.findOne({
    _id: subscriptionId,
    user: req.user.id,
    status: "pending"
  }).populate("plan");

  if (!sub) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  sub.status = "active";
  sub.startedAt = new Date();
  sub.expiresAt = new Date(
    Date.now() + sub.plan.validityDays * 24 * 60 * 60 * 1000
  );

  sub.razorpay.paymentId = paymentId;
  sub.razorpay.signature = signature;

  await sub.save();

  res.json({ success: true, upgraded: false });
};


// WEBHOOK FOR RAZORPAY EVENTS
exports.razorpayWebhook = async (req, res) => {
    const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== req.headers["x-razorpay-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.failed") {
      await UserSubscription.findOneAndUpdate(
      { "razorpay.orderId": event.payload.payment.entity.order_id },
        { status: "failed" }
      );
    }

    res.json({ received: true });
  };
