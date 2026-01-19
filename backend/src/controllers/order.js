const Order = require("../models/Order");
const Image = require("../models/Image");

/**
 * ADMIN: Get all orders with story images resolved
 */
exports.getAllOrders = async (req, res) => {
  try {
    // 1️⃣ Fetch orders
    const orders = await Order.find()
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
