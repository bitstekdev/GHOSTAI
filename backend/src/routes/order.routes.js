const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getMyOrders,
  getOrderById,
  allOrders
} = require("../controllers/order.controller");

router.get("/myorders", protect, getMyOrders);

// admin
router.get("/all-orders", protect, authorize('admin'), allOrders); 


router.get("/:orderId", protect, getOrderById);


module.exports = router;
