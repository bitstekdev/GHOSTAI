const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyOrders,
  getOrderById
} = require("../controllers/order.controller");

router.get("/myorders", protect, getMyOrders);
router.get("/:orderId", protect, getOrderById);


module.exports = router;
