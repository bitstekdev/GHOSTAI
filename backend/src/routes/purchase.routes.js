const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPurchaseOrder,
  createPurchaseOrderFromCart,
  verifyPurchasePayment,
  purchaseWebhook,
  downloadInvoice,
  getMyOrders
} = require("../controllers/purchase.controller");

router.post("/order/single", protect, createPurchaseOrder);
router.post("/order/cart", protect, createPurchaseOrderFromCart);
router.post("/verify", protect, verifyPurchasePayment);
router.post("/webhook", purchaseWebhook);

// download invoice
router.get("/:orderId/invoice", protect, downloadInvoice);
// get purchase history
router.get("/history", protect, getMyOrders);

module.exports = router;
