const express = require("express");
const router = express.Router();

const { generateOrderPdf } = require("../controllers/OrderPdf");

router.post(
  "/admin/orders/:orderId/generate-pdf",
  generateOrderPdf
);

module.exports = router;
