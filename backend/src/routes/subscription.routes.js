const express = require('express');
const router = express.Router();

const {protect, authorize} = require("../middleware/auth");

const planCtrl = require("../controllers/Admin/subscriptionPlan.controller");
const paymentCtrl = require("../controllers/payment.controller");

router.get("/plans", protect, authorize('admin'), planCtrl.getPlans);
router.post("/plans", protect, authorize('admin'), planCtrl.createPlan);
router.put("/plans/:id", protect, authorize('admin'), planCtrl.updatePlan);
router.put("/plans/archiveplan/:id", protect, authorize('admin'), planCtrl.archivePlan);
router.put("/plans/unarchiveplan/:id", protect, authorize('admin'), planCtrl.unarchivePlan);
router.delete("/plans/deleteplan/:id", protect, authorize('admin'), planCtrl.deletePlan);
// get plans for user
router.get("/plans/byShowOnContext", protect, authorize('user', 'admin'), planCtrl.getPlansByShowOnContext);

// Payment routes
router.post("/order", protect, paymentCtrl.createOrder);
router.post("/verify", protect, paymentCtrl.verifyPayment);
router.post("/webhook/razorpay", express.raw({ type: "application/json" }), paymentCtrl.razorpayWebhook);

module.exports = router;
