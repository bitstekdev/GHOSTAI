const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const { generateInvoicePdfStream } = require("../services/invoice.service");

// Helper to normalize shipping address
const normalizeShippingAddress = (address = {}) => ({
  name: address.fullName || address.name || "",
  phone: address.phoneNumber || address.phone || "",
  addressLine1: [
    address.houseNumber,
    address.streetName
  ].filter(Boolean).join(", "),
  addressLine2: address.addressLine2 || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.zipCode || address.postalCode || "",
  country: address.country || "India"
});


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
      shippingAddress: normalizeShippingAddress(shippingAddress),
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
      shippingAddress: normalizeShippingAddress(shippingAddress),
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
    // console.log("Verifying purchase payment:", req.body);

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Signature mismatch:", { expectedSignature, signature });
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Find order by Razorpay order ID
    const order = await Order.findOne({
      "razorpay.orderId": orderId,
    });

    if (!order) {
      console.error("Order not found for Razorpay ID:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Idempotent check
    if (order.status === "processing") {
      return res.json({ success: true });
    }

    // Update order
    order.status = "processing";
    order.razorpay.paymentId = paymentId;
    order.razorpay.signature = signature;
    await order.save();

    // Clear cart
    await User.findByIdAndUpdate(order.user, { cart: [] });

    res.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
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

      if (!order || order.status === "processing") {
        return res.json({ received: true });
      }

      order.status = "processing";
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



// VIEW INVOICE (inline)
exports.viewInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email")
      .populate("items.story", "title")
      .populate("items.plan", "name price");

    if (!order) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    generateInvoicePdfStream(order, res, "inline");
  } catch (err) {
    console.error("View invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};



// DOWNLOAD INVOICE
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email")
      .populate("items.story", "title")
      .populate("items.plan", "name price");

    if (!order) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    generateInvoicePdfStream(order, res, "attachment");
  } catch (err) {
    console.error("Download invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
