// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');
// const { parse } = require('node-html-parser');

// /* ======================================================
//    HELPER: DOWNLOAD IMAGE → BUFFER
// ====================================================== */
// async function loadImageAsBuffer(imageUrl) {
//   if (!imageUrl) return null;
//   const res = await fetch(imageUrl);
//   if (!res.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
//   const arrayBuffer = await res.arrayBuffer();
//   return Buffer.from(arrayBuffer);
// }

// /* ======================================================
//    CONSTANTS
// ====================================================== */
// const PAGE_LAYOUT = {
//   textWidthRatio: 0.55,
//   overlayRadius: 18,
//   padding: 32,
//   lineGap: 6,
// };

// const QR_CODE = {
//   size: 110,
//   margin: 40,
// };

// /* ======================================================
//    PAGE SIZE
// ====================================================== */
// function getPageSize(orientation) {
//   if (orientation === 'portrait') return [768, 1024];
//   if (orientation === 'square') return [1024, 1024];
//   return [1024, 768];
// }

// /* ======================================================
//    FONT REGISTRATION
// ====================================================== */
// function registerFonts(doc) {
//   const fontsDir = path.join(__dirname, 'fonts');
//   [
//     'Poppins-Regular',
//     'Poppins-Medium',
//     'Poppins-SemiBold',
//     'Poppins-Bold',
//     'Poppins-Italic',
//   ].forEach(f => {
//     doc.registerFont(f, path.join(fontsDir, `${f}.ttf`));
//   });
// }

// /* ======================================================
//    HTML → PDF STYLE MAP (matches your CSS)
// ====================================================== */
// const STYLE_MAP = {
//   base: {
//     font: 'Poppins-Regular',
//     fontSize: 18,
//     color: '#111827',
//   },
//   'highlight-place': {
//     font: 'Poppins-SemiBold',
//     color: '#0369a1',
//   },
//   'highlight-action': {
//     font: 'Poppins-Medium',
//     color: '#090909',
//     background: '#fef3c7',
//     radius: 6,
//   },
//   'highlight-emotion': {
//     font: 'Poppins-Italic',
//     color: '#166534',
//   },
//   'highlight-emphasis': {
//     font: 'Poppins-Bold',
//     fontSize: 20,
//     color: '#2b4393',
//   },
// };

// /* ======================================================
//    HTML → PDF RENDERER (p + span)
// ====================================================== */
// function renderHtmlToPdf(doc, html, x, y, width) {
//   const root = parse(html);
//   const p = root.querySelector('p');
//   if (!p) return;

//   doc.x = x;
//   doc.y = y;

//   p.childNodes.forEach(node => {
//     // Plain text
//     if (node.nodeType === 3) {
//       const text = node.text;
//       if (!text.trim()) return;

//       doc
//         .font(STYLE_MAP.base.font)
//         .fontSize(STYLE_MAP.base.fontSize)
//         .fillColor(STYLE_MAP.base.color)
//         .text(text, { continued: true });
//     }

//     // Span
//     if (node.tagName === 'SPAN') {
//       const cls = node.getAttribute('class');
//       const style = STYLE_MAP[cls] || STYLE_MAP.base;
//       const text = node.text;

//       const fontSize = style.fontSize || STYLE_MAP.base.fontSize;
//       doc.font(style.font).fontSize(fontSize).fillColor(style.color);

//       // Yellow pill background
//       if (style.background) {
//         const w = doc.widthOfString(text);
//         const h = fontSize + 6;

//         doc.save();
//         doc
//           .fillColor(style.background)
//           .roundedRect(doc.x - 2, doc.y - 2, w + 6, h, style.radius)
//           .fill();
//         doc.restore();
//       }

//       doc.text(text, { continued: true });
//     }
//   });

//   doc.text('');
// }

// /* ======================================================
//    MAIN GENERATOR
// ====================================================== */
// async function generateStorybookPdf({
//   outputPath,
//   orientation = 'landscape',
//   coverImageUrl,
//   coverTitle,
//   backCoverImageUrl,
//   backCoverBlurb,
//   pages = [],
// }) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ autoFirstPage: false });
//       const stream = fs.createWriteStream(outputPath);
//       doc.pipe(stream);

//       registerFonts(doc);
//       const size = getPageSize(orientation);

//       /* ================= COVER ================= */
//       doc.addPage({ size, margins: 0 });
//       const { width, height } = doc.page;

//       if (coverImageUrl) {
//         const img = await loadImageAsBuffer(coverImageUrl);
//         doc.image(img, 0, 0, { width, height });
//       }

//       if (coverTitle) {
//         const boxWidth = width * 0.65;
//         const boxX = (width - boxWidth) / 2;
//         const boxY = height * 0.38;

//         doc.font('Poppins-Bold').fontSize(44);
//         const textHeight = doc.heightOfString(coverTitle, {
//           width: boxWidth,
//           align: 'center',
//         });

//         const boxHeight = textHeight + 40;

//         doc.save();
//         doc.fillOpacity(0.42).fillColor('white');
//         doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 18).fill();
//         doc.restore();

//         doc.fillColor('black').text(coverTitle, boxX, boxY + 20, {
//           width: boxWidth,
//           align: 'center',
//         });
//       }

//       /* ================= STORY PAGES ================= */
//       for (const page of pages) {
//         // IMAGE PAGE
//         doc.addPage({ size, margins: 0 });
//         if (page.imageUrl) {
//           const img = await loadImageAsBuffer(page.imageUrl);
//           doc.image(img, 0, 0, {
//             width: doc.page.width,
//             height: doc.page.height,
//           });
//         }

//         // TEXT PAGE
//         doc.addPage({ size, margins: 0 });
//         if (page.backgroundImageUrl) {
//           const bg = await loadImageAsBuffer(page.backgroundImageUrl);
//           doc.image(bg, 0, 0, {
//             width: doc.page.width,
//             height: doc.page.height,
//           });
//         }

//         const panelWidth = doc.page.width * PAGE_LAYOUT.textWidthRatio;
//         const panelX = (doc.page.width - panelWidth) / 2;
//         const panelY = doc.page.height * 0.18;

//         // Measure clean text height
//         const cleanText = page.html.replace(/<[^>]*>/g, '');
//         doc.font('Poppins-Regular').fontSize(18);
//         const textHeight = doc.heightOfString(cleanText, {
//           width: panelWidth - PAGE_LAYOUT.padding * 2,
//           lineGap: PAGE_LAYOUT.lineGap,
//         });

//         const panelHeight = textHeight + PAGE_LAYOUT.padding * 2;

//         doc.save();
//         doc.fillOpacity(0.4).fillColor('white');
//         doc
//           .roundedRect(
//             panelX,
//             panelY,
//             panelWidth,
//             panelHeight,
//             PAGE_LAYOUT.overlayRadius
//           )
//           .fill();
//         doc.restore();

//         // Render HTML with highlights
//         renderHtmlToPdf(
//           doc,
//           page.html,
//           panelX + PAGE_LAYOUT.padding,
//           panelY + PAGE_LAYOUT.padding,
//           panelWidth - PAGE_LAYOUT.padding * 2
//         );
//       }

//       /* ================= BACK COVER ================= */
//       if (backCoverImageUrl) {
//         doc.addPage({ size, margins: 0 });
//         const img = await loadImageAsBuffer(backCoverImageUrl);
//         doc.image(img, 0, 0, {
//           width: doc.page.width,
//           height: doc.page.height,
//         });

//         const qrY = doc.page.height - QR_CODE.size - QR_CODE.margin;

//         if (backCoverBlurb) {
//           const boxWidth = doc.page.width * 0.7;
//           const boxX = (doc.page.width - boxWidth) / 2;

//           doc.font('Poppins-Medium').fontSize(16);
//           const textHeight = doc.heightOfString(backCoverBlurb, {
//             width: boxWidth - PAGE_LAYOUT.padding * 2,
//             align: 'center',
//             lineGap: 5,
//           });

//           const boxHeight = textHeight + PAGE_LAYOUT.padding * 2;
//           const boxY = qrY - boxHeight - 24;

//           doc.save();
//           doc.fillOpacity(0.45).fillColor('white');
//           doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 20).fill();
//           doc.restore();

//           doc.fillColor('black').text(
//             backCoverBlurb,
//             boxX + PAGE_LAYOUT.padding,
//             boxY + PAGE_LAYOUT.padding,
//             {
//               width: boxWidth - PAGE_LAYOUT.padding * 2,
//               align: 'center',
//               lineGap: 5,
//             }
//           );
//         }
//       }

//       doc.end();
//       stream.on('finish', () => resolve(outputPath));
//     } catch (e) {
//       reject(e);
//     }
//   });
// }

// module.exports = { generateStorybookPdf };

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

/* ======================================================
   HELPER: DOWNLOAD IMAGE → BUFFER
====================================================== */
async function loadImageAsBuffer(imageUrl) {
  if (!imageUrl) return null;
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/* ======================================================
   CONSTANTS
====================================================== */
const PAGE_LAYOUT = {
  textWidthRatio: 0.55,
  overlayRadius: 18,
  padding: 32,
};

const QR_CODE = {
  size: 110,
  margin: 40,
};

/* ======================================================
   PAGE SIZE
====================================================== */
function getPageSize(orientation) {
  if (orientation === 'portrait') return [768, 1024];
  if (orientation === 'square') return [1024, 1024];
  return [1024, 768];
}

/* ======================================================
   FONT REGISTRATION
====================================================== */
function registerFonts(doc) {
  const fontsDir = path.join(__dirname, 'fonts');
  [
    'Poppins-Regular',
    'Poppins-Medium',
    'Poppins-SemiBold',
    'Poppins-Bold',
    'Poppins-Italic',
  ].forEach(f =>
    doc.registerFont(f, path.join(fontsDir, `${f}.ttf`))
  );
}

/* ======================================================
   HTML → PDF WORD-LEVEL RENDERER (FIXED)
====================================================== */
function renderHtmlToPdf(doc, html, startX, startY, maxWidth) {
  const root = parse(html);
  const p = root.querySelector('p');
  if (!p) return;

  let x = startX;
  let y = startY;

  const lineHeight = 26;

  const baseStyle = {
    font: 'Poppins-Regular',
    fontSize: 18,
    color: '#111827',
  };

  const styles = {
    'highlight-place': {
      font: 'Poppins-SemiBold',
      color: '#0369a1',
    },
    'highlight-action': {
      font: 'Poppins-Medium',
      color: '#090909',
      background: '#fef3c7',
      radius: 6,
      paddingX: 6,
      paddingY: 4,
    },
    'highlight-emotion': {
      font: 'Poppins-Italic',
      color: '#166534',
    },
    'highlight-emphasis': {
      font: 'Poppins-Bold',
      fontSize: 20,
      color: '#2b4393',
    },
  };

  function newLine() {
    x = startX;
    y += lineHeight;
  }

  function drawWord(word, style) {
    const fontSize = style.fontSize || baseStyle.fontSize;
    doc.font(style.font).fontSize(fontSize);

    const wordWidth = doc.widthOfString(word + ' ');

    if (x + wordWidth > startX + maxWidth) {
      newLine();
    }

    // Background for highlight-action
    if (style.background) {
      const height = fontSize + style.paddingY * 2;

      doc.save();
      doc.fillColor(style.background);
      doc.roundedRect(
        x - 2,
        y - style.paddingY,
        wordWidth + style.paddingX,
        height,
        style.radius
      ).fill();
      doc.restore();
    }

    doc.fillColor(style.color);
    doc.text(word + ' ', x, y, { lineBreak: false });

    x += wordWidth;
  }

  p.childNodes.forEach(node => {
    // Plain text
    if (node.nodeType === 3) {
      node.text.split(' ').forEach(word => {
        if (word) drawWord(word, baseStyle);
      });
    }

    // Span with class
    if (node.tagName === 'SPAN') {
      const cls = node.getAttribute('class');
      const style = { ...baseStyle, ...(styles[cls] || {}) };

      node.text.split(' ').forEach(word => {
        if (word) drawWord(word, style);
      });
    }
  });
}

/* ======================================================
   MAIN PDF GENERATOR
====================================================== */
async function generateStorybookPdf({
  outputPath,
  orientation = 'landscape',
  coverImageUrl,
  coverTitle,
  backCoverImageUrl,
  backCoverBlurb,
  pages = [],
}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      registerFonts(doc);
      const size = getPageSize(orientation);

      /* ================= COVER ================= */
      doc.addPage({ size, margins: 0 });
      const { width, height } = doc.page;

      if (coverImageUrl) {
        const img = await loadImageAsBuffer(coverImageUrl);
        doc.image(img, 0, 0, { width, height });
      }

      if (coverTitle) {
        const boxWidth = width * 0.65;
        const boxX = (width - boxWidth) / 2;
        const boxY = height * 0.38;

        doc.font('Poppins-Bold').fontSize(44);
        const textHeight = doc.heightOfString(coverTitle, {
          width: boxWidth,
          align: 'center',
        });

        const boxHeight = textHeight + 40;

        doc.save();
        doc.fillOpacity(0.42).fillColor('white');
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 18).fill();
        doc.restore();

        doc.fillColor('black').text(coverTitle, boxX, boxY + 20, {
          width: boxWidth,
          align: 'center',
        });
      }

      /* ================= STORY PAGES ================= */
      for (const page of pages) {
        // IMAGE PAGE
        doc.addPage({ size, margins: 0 });
        if (page.imageUrl) {
          const img = await loadImageAsBuffer(page.imageUrl);
          doc.image(img, 0, 0, {
            width: doc.page.width,
            height: doc.page.height,
          });
        }

        // TEXT PAGE
        doc.addPage({ size, margins: 0 });
        if (page.backgroundImageUrl) {
          const bg = await loadImageAsBuffer(page.backgroundImageUrl);
          doc.image(bg, 0, 0, {
            width: doc.page.width,
            height: doc.page.height,
          });
        }

        const panelWidth = doc.page.width * PAGE_LAYOUT.textWidthRatio;
        const panelX = (doc.page.width - panelWidth) / 2;
        const panelY = doc.page.height * 0.18;

        // Measure clean text for panel height
        const cleanText = page.html.replace(/<[^>]*>/g, '');
        doc.font('Poppins-Regular').fontSize(18);
        const textHeight = doc.heightOfString(cleanText, {
          width: panelWidth - PAGE_LAYOUT.padding * 2,
        });

        const panelHeight = textHeight + PAGE_LAYOUT.padding * 2;

        doc.save();
        doc.fillOpacity(0.4).fillColor('white');
        doc
          .roundedRect(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            PAGE_LAYOUT.overlayRadius
          )
          .fill();
        doc.restore();

        renderHtmlToPdf(
          doc,
          page.html,
          panelX + PAGE_LAYOUT.padding,
          panelY + PAGE_LAYOUT.padding,
          panelWidth - PAGE_LAYOUT.padding * 2
        );
      }

      /* ================= BACK COVER ================= */
      if (backCoverImageUrl) {
        doc.addPage({ size, margins: 0 });
        const img = await loadImageAsBuffer(backCoverImageUrl);
        doc.image(img, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });

        const qrY = doc.page.height - QR_CODE.size - QR_CODE.margin;

        if (backCoverBlurb) {
          const boxWidth = doc.page.width * 0.7;
          const boxX = (doc.page.width - boxWidth) / 2;

          doc.font('Poppins-Medium').fontSize(16);
          const textHeight = doc.heightOfString(backCoverBlurb, {
            width: boxWidth - PAGE_LAYOUT.padding * 2,
            align: 'center',
          });

          const boxHeight = textHeight + PAGE_LAYOUT.padding * 2;
          const boxY = qrY - boxHeight - 24;

          doc.save();
          doc.fillOpacity(0.45).fillColor('white');
          doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 20).fill();
          doc.restore();

          doc.fillColor('black').text(
            backCoverBlurb,
            boxX + PAGE_LAYOUT.padding,
            boxY + PAGE_LAYOUT.padding,
            {
              width: boxWidth - PAGE_LAYOUT.padding * 2,
              align: 'center',
            }
          );
        }
      }

      doc.end();
      stream.on('finish', () => resolve(outputPath));
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateStorybookPdf };
