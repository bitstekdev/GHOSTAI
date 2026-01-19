const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const cart = require("../controllers/cart.controller");

router.post("/add", protect, cart.addToCart);
router.get("/", protect, cart.getCart);
router.patch("/update", protect, cart.updateCartItem);
router.delete("/remove", protect, cart.removeCartItem);
router.delete("/clear", protect, cart.clearCart);

module.exports = router;
