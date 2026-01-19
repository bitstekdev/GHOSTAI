const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: "India"
    }
  },
  { _id: false }
);


const orderItemSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    unitPrice: {
      type: Number,
      required: true
    },

    totalPrice: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["subscription", "purchase"],
      required: true
    },

    items: {
      type: [orderItemSchema],
      required: true
    },

    shippingAddress: addressSchema,

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String
    },

     invoice: {
      number: String,
      pdfUrl: String,
      generatedAt: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
