const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const { generateInvoicePdf } = require("../services/invoice.service");

// PURCHASE SINGLE ITEM----------
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { storyId, planId, shippingAddress, quantity } = req.body;
    // console.log("Received purchase request:", req.body);

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });

    const item = {
      story: storyId,
      plan: plan._id,
      quantity: quantity || 1,
      unitPrice: plan.price,
      totalPrice: plan.price * (quantity || 1),
    };

    const rpOrder = await razorpay.orders.create({
      amount: plan.price * (quantity || 1) * 100,
      currency: "INR",
      receipt: `purchase_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user.id,
      type: "purchase",
      items: [item],
      shippingAddress,
      amount: plan.price * (quantity || 1),
      razorpay: { orderId: rpOrder.id },
    });

    res.json({ success: true, orderId: order._id, razorpayOrder: rpOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PURCHASE FROM CART----------
exports.createPurchaseOrderFromCart = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    // console.log("Shipping Address:", shippingAddress);
    const user = await User.findById(req.user.id)
      .populate("cart.storyId")
      .populate("cart.planId");

    if (!user.cart.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const items = user.cart.map((c) => {
      const itemTotal = c.planId.price * c.quantity;
      totalAmount += itemTotal;

      return {
        story: c.storyId._id,
        plan: c.planId._id,
        quantity: c.quantity,
        unitPrice: c.planId.price,
        totalPrice: itemTotal,
      };
    });

    const rpOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user.id,
      type: "purchase",
      items,
      shippingAddress,
      amount: totalAmount,
      razorpay: { orderId: rpOrder.id },
    });

    res.json({ success: true, orderId: order._id, razorpayOrder: rpOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY PURCHASE PAYMENT----------
exports.verifyPurchasePayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findOne({
      "razorpay.orderId": orderId,
    });

    order.status = "paid";
    order.razorpay.paymentId = paymentId;
    order.razorpay.signature = signature;
    await order.save();

    // Clear cart
    await User.findByIdAndUpdate(order.user, { cart: [] });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WEBHOOK FOR PURCHASE PAYMENT VERIFICATION----------
exports.purchaseWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== req.headers["x-razorpay-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    /* ---------------- PAYMENT SUCCESS ---------------- */
    if (event.event === "payment.captured") {
      const orderId = event.payload.payment.entity.order_id;

      const order = await Order.findOne({
        "razorpay.orderId": orderId,
      })
        .populate("user")
        .populate("items.story")
        .populate("items.plan");

      if (!order || order.status === "paid") {
        return res.json({ received: true });
      }

      order.status = "paid";
      await order.save();

      // 📧 Send confirmation email
      // await sendOrderSuccessEmail(order);
    }

    /* ---------------- PAYMENT FAILED ---------------- */
    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;

      await Order.findOneAndUpdate(
        { "razorpay.orderId": orderId },
        { status: "failed" },
      );
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PURCHASE HISTORY----------
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.story")
      .populate("items.plan")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD INVOICE----------
exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      status: "paid",
    })
      .populate("items.story")
      .populate("items.plan");

    if (!order) {
      return res.status(404).json({
        message: "Invoice not available",
      });
    }

    const { filePath, filename } = await generateInvoicePdf(order);

    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
