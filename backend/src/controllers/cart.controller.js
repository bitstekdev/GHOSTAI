const User = require("../models/User");
const Image = require("../models/Image");

// Add item to cart--------------------
exports.addToCart = async (req, res) => {
  try {
    const { storyId, planId, quantity = 1 } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cart.find(
      (c) => c.storyId.toString() === storyId && c.planId.toString() === planId,
    );

    if (item) {
      item.quantity += quantity;
    } else {
      user.cart.push({ storyId, planId, quantity });
    }

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// update cart item quantity--------------------
exports.updateCartItem = async (req, res) => {
  try {
    const { storyId, planId, quantity } = req.body;

    const user = await User.findById(req.user.id);

    const item = user.cart.find(
      (c) => c.storyId.toString() === storyId && c.planId.toString() === planId,
    );

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity <= 0) {
      user.cart = user.cart.filter(
        (c) =>
          !(c.storyId.toString() === storyId && c.planId.toString() === planId),
      );
    } else {
      item.quantity = quantity;
    }

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

//remove cart item--------------------
exports.removeCartItem = async (req, res) => {
  try {
    const { storyId, planId } = req.body;

    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (c) =>
        !(c.storyId.toString() === storyId && c.planId.toString() === planId),
    );

    await user.save();
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing cart item", error: error.message });
  }
};

// clear cart--------------------
exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { cart: [] });
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// get cart--------------------
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "cart.storyId",
        populate: {
          path: "coverImage",
          select: "s3Url", 
        },
      })
      .populate("cart.planId");

    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};
