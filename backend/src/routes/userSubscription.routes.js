const express = require('express');
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");


const ctrl = require("../controllers/userSubscription.controller");

router.get("/status", protect, ctrl.getSubscriptionStatus);
router.get("/active", protect, ctrl.getActiveSubscription);
router.get("/usage", protect, ctrl.getUsageLeft);
router.get("/history", protect, ctrl.getPurchaseHistory);
router.get("/all", protect, authorize('admin'), ctrl.getAllUserSubscriptions);
module.exports = router;
