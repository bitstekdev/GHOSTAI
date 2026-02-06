const Order = require('../models/Order');
const Image = require("../models/Image");


/**
 * Get all my orders with story images resolved
 */
exports.getMyOrders = async (req, res) => {
    const userId = req.user.id;
  try {
    // 1️⃣ Fetch orders
    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate({
        path: "items.story",
        select: "title genres numOfPages coverImage backCoverImage"
      })
      .populate("items.plan")
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Collect all image IDs
    const imageIds = new Set();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.story?.coverImage) {
          imageIds.add(item.story.coverImage.toString());
        }
        if (item.story?.backCoverImage) {
          imageIds.add(item.story.backCoverImage.toString());
        }
      });
    });

    // 3️⃣ Fetch images in ONE query
    const images = await Image.find({
      _id: { $in: [...imageIds] }
    })
      .select("_id s3Url imageType")
      .lean();

    // 4️⃣ Map images by ID
    const imageMap = {};
    images.forEach(img => {
      imageMap[img._id.toString()] = img.s3Url;
    });

    // 5️⃣ Attach URLs to stories
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.story) {
          item.story.coverImageUrl =
            imageMap[item.story.coverImage?.toString()] || null;

          item.story.backCoverImageUrl =
            imageMap[item.story.backCoverImage?.toString()] || null;
        }
      });
    });

    // 6️⃣ Respond
    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};


// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
    } catch (error) {   
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


/**
 * ADMIN - Get all orders (including deleted stories)
 */
exports.allOrders = async (req, res) => {
  try {
    // 1️⃣ Fetch all orders
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate({
        path: "items.story",
        select: "title genres numOfPages coverImage backCoverImage isDeleted"
      })
      .populate("items.plan")
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Collect all image IDs safely
    const imageIds = new Set();

    orders.forEach(order => {
      if (!Array.isArray(order.items)) return;

      order.items.forEach(item => {
        if (!item.story) return;

        if (item.story.coverImage) {
          imageIds.add(item.story.coverImage.toString());
        }
        if (item.story.backCoverImage) {
          imageIds.add(item.story.backCoverImage.toString());
        }
      });
    });

    // 3️⃣ Fetch images only if needed
    let images = [];
    if (imageIds.size > 0) {
      images = await Image.find({
        _id: { $in: [...imageIds] }
      })
        .select("_id s3Url")
        .lean();
    }

    // 4️⃣ Map images by ID
    const imageMap = {};
    images.forEach(img => {
      imageMap[img._id.toString()] = img.s3Url;
    });

    // 5️⃣ Attach image URLs + deleted flags
    orders.forEach(order => {
      if (!Array.isArray(order.items)) return;

      order.items.forEach(item => {
        if (!item.story) {
          // Story hard-deleted from DB
          item.story = {
            title: "Deleted Story",
            isDeleted: true,
            coverImageUrl: null,
            backCoverImageUrl: null
          };
          return;
        }

        item.story.coverImageUrl =
          imageMap[item.story.coverImage?.toString()] || null;

        item.story.backCoverImageUrl =
          imageMap[item.story.backCoverImage?.toString()] || null;
      });
    });

    // 6️⃣ Response
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("ADMIN allOrders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};


// ADMIN - Update Order Status
// UPDATE ORDER STATUS (ADMIN)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [ "pending","processing", "shipped", "delivered", "failed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      status
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};
