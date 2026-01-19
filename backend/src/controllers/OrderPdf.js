const Order = require("../models/Order");
const Story = require("../models/Story");
const { generateStorybookPdf } = require("../pdf/fonts/generateStorybookPdf");
const path = require("path");
const fs = require("fs");

/**
 * ADMIN: Generate PDF for an order
 */
exports.generateOrderPdf = async (req, res) => {
  const { orderId } = req.params;

  console.log("🟡 PDF generation requested:", orderId);

  const order = await Order.findById(orderId)
    .populate("user")
    .populate("story");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.payment.status !== "PAID") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  const pdfDir = path.join(__dirname, "../../uploads/pdfs");
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

  const pdfPath = path.join(pdfDir, `order_${order._id}.pdf`);

  try {
    order.pdf.status = "GENERATING";
    await order.save();

    console.log("📘 Generating PDF:", pdfPath);

    await generateStorybookPdf({
      outputPath: pdfPath,
      orientation: "landscape",
      coverImageUrl: order.story.coverImageUrl,
      coverTitle: order.story.title,
      backCoverImageUrl: order.story.backCoverImageUrl,
      backCoverBlurb: order.story.backCoverBlurb,
      pages: order.story.pages,
      genre: order.story.genre,
      textColor: "black"
    });

    order.pdf.status = "READY";
    order.pdf.path = `/uploads/pdfs/order_${order._id}.pdf`;
    order.pdf.generatedAt = new Date();
    await order.save();

    console.log("✅ PDF READY");

    res.json({
      success: true,
      pdfUrl: order.pdf.path
    });

  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    order.pdf.status = "FAILED";
    await order.save();
    res.status(500).json({ message: "PDF generation failed" });
  }
};
