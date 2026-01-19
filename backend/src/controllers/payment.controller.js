const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const UserSubscription = require("../models/UserSubscription");
const { upgradeSubscription } = require("../services/subscriptionUpgrade.service");



// CREATE ORDER
exports.createOrder = async (req, res) => {
  const { planId } = req.body;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  const order = await razorpay.orders.create({
    amount: plan.price * 100,
    currency: plan.currency,
    receipt: `rcpt_${Date.now()}`
  });

  const sub = await UserSubscription.create({
    user: req.user.id,
    plan: plan._id,
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
    isUpgrade
  } = req.body;

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  // 2️⃣ ⚠️ SAFETY CHECK — ADD THIS HERE
  if (isUpgrade === true) {
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

    // 3️⃣ 🔁 NOW SAFE TO UPGRADE
    await upgradeSubscription({
      userId: req.user.id,
      newPlanId: planId,
      razorpayDetails: {
        orderId,
        paymentId,
        signature
      }
    });

    return res.json({
      success: true,
      upgraded: true
    });
  }

  // 4️⃣ 🆕 NORMAL PURCHASE FLOW
  const sub = await UserSubscription.findById(subscriptionId)
    .populate("plan");

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

  res.json({
    success: true,
    upgraded: false
  });
};


// WEBHOOK FOR RAZORPAY EVENTS
exports.razorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== req.headers["x-razorpay-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;

      await UserSubscription.findOneAndUpdate(
        { "razorpay.orderId": orderId },
        { status: "failed" }
      );
    }

    if (event.event === "subscription.captured") {
        // create order function==========================================================
    }

    res.json({ received: true });
  };