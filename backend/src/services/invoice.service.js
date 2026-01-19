const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.generateInvoicePdf = async (order) => {
  const invoiceNo = `INV-${order._id}`;
  const invoicesDir = path.join(__dirname, "../invoices");

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
  }

  const filePath = path.join(invoicesDir, `${invoiceNo}.pdf`);

  // Reuse if already generated
  if (fs.existsSync(filePath)) {
    return { filePath, filename: `${invoiceNo}.pdf` };
  }

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Invoice No: ${invoiceNo}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
  doc.moveDown();

  doc.text("Items:");
  doc.moveDown(0.5);

  order.items.forEach(item => {
    doc.text(
      `${item.quantity} × ${item.story.title} (${item.plan.name}) - ₹${item.totalPrice}`
    );
  });

  doc.moveDown();
  doc.text(`Total Amount: ₹${order.amount}`, { bold: true });

  doc.end();

  return {
    filePath,
    filename: `${invoiceNo}.pdf`
  };
};
