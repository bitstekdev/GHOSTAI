const PDFDocument = require("pdfkit");

exports.generateInvoicePdfStream = (order, res, mode = "inline") => {
  const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${mode}; filename="${invoiceNo}.pdf"`
  );

  const doc = new PDFDocument({ margin: 40 });

  // 🔥 Stream directly to response
  doc.pipe(res);

  /* ---------------- HEADER ---------------- */
  doc
    .fontSize(22)
    .text("INVOICE", { align: "center", underline: true });

  doc.moveDown(1.5);

  /* ---------------- SELLER ---------------- */
  doc.fontSize(10).text("Sold By:");
  doc.fontSize(12).text("Ghostverse.ai");
  doc.text("Email: support@ghostverse.ai");
  doc.text("Country: India");

  doc.moveDown();

  /* ---------------- META ---------------- */
  doc.fontSize(10);
  doc.text(`Invoice No: ${invoiceNo}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
  doc.text(`Payment Status: ${order.status.toUpperCase()}`);

  doc.moveDown(1.5);

  /* ---------------- CUSTOMER ---------------- */
  doc.fontSize(10).text("Billed To:");
  doc.fontSize(12).text(order.user?.name || "Customer");
  doc.text(order.user?.email || "");

  const a = order.shippingAddress || {};
  [
    a.addressLine1,
    a.addressLine2,
    a.city,
    a.state,
    a.postalCode,
    a.country
  ].filter(Boolean).forEach(line => doc.text(line));

  doc.moveDown(1.5);

  /* ---------------- ITEMS ---------------- */
  doc.fontSize(12).text("Order Items", { underline: true });
  doc.moveDown(0.5);

  let subtotal = 0;

  order.items.forEach((item, i) => {
    subtotal += item.totalPrice;

    doc.fontSize(11).text(
      `${i + 1}. ${item.story?.title || "Story"}`
    );
    doc.fontSize(10).text(
      `   Plan: ${item.plan?.name} | Qty: ${item.quantity} | Unit: ₹${item.unitPrice}`
    );
    doc.fontSize(10).text(
      `   Item Total: ₹${item.totalPrice}`
    );
    doc.moveDown(0.6);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Subtotal: ₹${subtotal}`);
  doc.text(`Shipping: ₹0`);
  doc.fontSize(14).text(`Grand Total: ₹${order.amount}`, { bold: true });

  /* ---------------- FOOTER ---------------- */
  doc.moveDown(2);
  doc.fontSize(9)
     .fillColor("gray")
     .text(
       "This is a computer-generated invoice and does not require a signature.",
       { align: "center" }
     );

  doc.end();
};
