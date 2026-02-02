const express = require("express");
const router = express.Router();
const { getAllOrders } = require("../controllers/order");
const {protect, authorize} = require("../middleware/auth");

router.get("/allOrders", protect, authorize("admin") , getAllOrders);

module.exports = router;
