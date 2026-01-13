const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const { getPdfTypographyByGenre } = require('./pdfTypography');

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
  const fontsDir = __dirname;

  // Alegreya (Family)
  doc.registerFont('Alegreya-Regular', path.join(fontsDir, 'Alegreya-Regular.ttf'));
  doc.registerFont('Alegreya-Medium', path.join(fontsDir, 'Alegreya-Medium.ttf'));
  doc.registerFont('Alegreya-Bold', path.join(fontsDir, 'Alegreya-Bold.ttf'));
  doc.registerFont('Alegreya-Italic', path.join(fontsDir, 'Alegreya-Italic.ttf'));

  // Cormorant Garamond (Fantasy)
  doc.registerFont('CormorantGaramond-Regular', path.join(fontsDir, 'CormorantGaramond-Regular.ttf'));
  doc.registerFont('CormorantGaramond-Bold', path.join(fontsDir, 'CormorantGaramond-Bold.ttf'));
  doc.registerFont('CormorantGaramond-Italic', path.join(fontsDir, 'CormorantGaramond-Italic.ttf'));

  // Libre Baskerville (Adventure)
  doc.registerFont('LibreBaskerville-Regular', path.join(fontsDir, 'LibreBaskerville-Regular.ttf'));
  doc.registerFont('LibreBaskerville-Bold', path.join(fontsDir, 'LibreBaskerville-Bold.ttf'));
  doc.registerFont('LibreBaskerville-Italic', path.join(fontsDir, 'LibreBaskerville-Italic.ttf'));

  // Crimson Text (Mystery)
  doc.registerFont('CrimsonText-Regular', path.join(fontsDir, 'CrimsonText-Regular.ttf'));
  doc.registerFont('CrimsonText-Bold', path.join(fontsDir, 'CrimsonText-Bold.ttf'));
  doc.registerFont('CrimsonText-Italic', path.join(fontsDir, 'CrimsonText-Italic.ttf'));

  // Source Serif 4 (Sci-Fi)
  doc.registerFont('SourceSerif4-Regular', path.join(fontsDir, 'SourceSerif4-Regular.ttf'));
  doc.registerFont('SourceSerif4-Bold', path.join(fontsDir, 'SourceSerif4-Bold.ttf'));
  doc.registerFont('SourceSerif4-Italic', path.join(fontsDir, 'SourceSerif4-Italic.ttf'));

  // Playfair Display (Marriage / decorative)
  doc.registerFont('PlayfairDisplay-Regular', path.join(fontsDir, 'PlayfairDisplay-Regular.ttf'));
  doc.registerFont('PlayfairDisplay-Bold', path.join(fontsDir, 'PlayfairDisplay-Bold.ttf'));
  doc.registerFont('PlayfairDisplay-Italic', path.join(fontsDir, 'PlayfairDisplay-Italic.ttf'));

  // Fallbacks / Poppins (if present)
  try {
    doc.registerFont('Poppins-Regular', path.join(fontsDir, 'Poppins-Regular.ttf'));
    doc.registerFont('Poppins-Medium', path.join(fontsDir, 'Poppins-Medium.ttf'));
    doc.registerFont('Poppins-SemiBold', path.join(fontsDir, 'Poppins-SemiBold.ttf'));
    doc.registerFont('Poppins-Bold', path.join(fontsDir, 'Poppins-Bold.ttf'));
    doc.registerFont('Poppins-Italic', path.join(fontsDir, 'Poppins-Italic.ttf'));
  } catch (e) {
    // If Poppins isn't available, it's non-fatal — we have book fonts
  }
}

// Helpers: derive display styles from genre typography
function getTitleTypography(t) {
  return {
    font: t.fontBold || t.fontMedium,
    size: (t.fontSize || 21) + 16,
    letterSpacing: (t.letterSpacing || 0) + 0.6,
  };
}

function getTitleSubTypography(t) {
  return {
    font: t.fontMedium || t.fontRegular,
    size: (t.fontSize || 21) + 6,
    letterSpacing: (t.letterSpacing || 0) + 0.4,
  };
}

function getBackBlurbTypography(t) {
  return {
    font: t.fontRegular,
    size: (t.fontSize || 21) - 2,
    lineGap: 6,
  };
}

/* ======================================================
   HTML → PDF WORD-LEVEL RENDERER (FIXED)
====================================================== */
function renderHtmlToPdf(doc, html, startX, startY, maxWidth, maxHeight, genre = 'Family', fontScale = 1) {
  // Paragraph-based renderer: preserves shaping/kerning and avoids per-word drawing.
  // This intentionally does not apply characterSpacing to body text (books look
  // best with 0 extra spacing). Inline highlights are ignored to keep a single
  // render pass; if needed we can implement run-based continued text later.
  const root = parse(html);
  const p = root.querySelector('p');
  if (!p) return false;

  const typography = getPdfTypographyByGenre(genre);

  // Use slightly smaller defaults for on-page (book) rendering to avoid over-wrapping
  const effectiveFontSize = Math.min(typography.fontSize || 21, 19) * fontScale;
  const effectiveLineHeight = Math.min(typography.lineHeight || 34, 30) * fontScale;

  const fontName = typography.fontRegular || typography.fontMedium || 'Poppins-Medium';

  doc.font(fontName).fontSize(effectiveFontSize);

  const lineGap = Math.max(0, effectiveLineHeight - effectiveFontSize);

  const cleanText = p.text.replace(/\s+/g, ' ').trim();

  // Measure how tall the paragraph would be with these settings
  const measureOptions = {
    width: maxWidth,
    characterSpacing: 0,
    lineGap,
  };

  const measuredHeight = doc.heightOfString(cleanText, measureOptions);

  // If measured height exceeds available space, compute a single-fit scale
  const availableHeight = maxHeight;
  if (measuredHeight > availableHeight) {
    const fitScale = availableHeight / measuredHeight;
    const minScale = 0.78;
    const appliedScale = Math.max(fitScale, minScale);

    const adjustedFontSize = Math.max(10, Math.floor(effectiveFontSize * appliedScale));
    const adjustedLineGap = Math.max(0, Math.floor((effectiveLineHeight * appliedScale) - adjustedFontSize));

    doc.font(fontName).fontSize(adjustedFontSize);

    // final render with adjusted settings — use continued text runs to preserve
    // shaping and inline highlight spans. Build highlight run map from typography.
    const highlightRuns = {
      'highlight-place': { font: typography.fontMedium || typography.fontRegular, fillColor: '#2b4f7a' },
      'highlight-action': { font: typography.fontMedium || typography.fontRegular, fillColor: '#111827' },
      'highlight-emotion': { font: typography.fontItalic || typography.fontRegular, fillColor: '#3f6b4f' },
      'highlight-emphasis': { font: typography.fontBold || typography.fontMedium, fillColor: '#1f2937' },
    };

    const renderRuns = (fontSizeToUse, lineGapToUse) => {
      let firstChunk = true;
      const nodes = p.childNodes && p.childNodes.length ? p.childNodes : [{ nodeType: 3, rawText: p.text }];

      for (const node of nodes) {
        const text = (node.rawText || node.text || node.textContent || '').replace(/\s+/g, ' ');
        if (!text) continue;

        let runFont = fontName;
        let runColor = '#111827';

        if (node.tagName && node.tagName.toLowerCase() === 'span') {
          const cls = (node.getAttribute && node.getAttribute('class')) || (node.attrs && node.attrs.class) || '';
          const hit = highlightRuns[cls];
          if (hit) {
            runFont = hit.font || runFont;
            runColor = hit.fillColor || runColor;
          }
        }

        doc.font(runFont).fontSize(fontSizeToUse).fillColor(runColor);

        if (firstChunk) {
          doc.text(text, startX, startY, { width: maxWidth, continued: true, lineGap: lineGapToUse, characterSpacing: 0 });
          firstChunk = false;
        } else {
          doc.text(text, { continued: true });
        }
      }

      // end paragraph
      doc.text('', { continued: false });
    };

    renderRuns(adjustedFontSize, adjustedLineGap);

    return true;
  }

  // Normal render — render as continued runs so inline <span> highlights are preserved
  const highlightRuns = {
    'highlight-place': { font: typography.fontMedium || typography.fontRegular, fillColor: '#2b4f7a' },
    'highlight-action': { font: typography.fontMedium || typography.fontRegular, fillColor: '#111827' },
    'highlight-emotion': { font: typography.fontItalic || typography.fontRegular, fillColor: '#3f6b4f' },
    'highlight-emphasis': { font: typography.fontBold || typography.fontMedium, fillColor: '#1f2937' },
  };

  let firstChunk = true;
  const nodes = p.childNodes && p.childNodes.length ? p.childNodes : [{ nodeType: 3, rawText: p.text }];

  for (const node of nodes) {
    const text = (node.rawText || node.text || node.textContent || '').replace(/\s+/g, ' ');
    if (!text) continue;

    let runFont = fontName;
    let runColor = '#111827';

    if (node.tagName && node.tagName.toLowerCase() === 'span') {
      const cls = (node.getAttribute && node.getAttribute('class')) || (node.attrs && node.attrs.class) || '';
      const hit = highlightRuns[cls];
      if (hit) {
        runFont = hit.font || runFont;
        runColor = hit.fillColor || runColor;
      }
    }

    doc.font(runFont).fontSize(effectiveFontSize).fillColor(runColor);

    if (firstChunk) {
      doc.text(text, startX, startY, { width: maxWidth, continued: true, lineGap, characterSpacing: 0 });
      firstChunk = false;
    } else {
      doc.text(text, { continued: true });
    }
  }

  // finish paragraph
  doc.text('', { continued: false });

  return true;
}
  async function generateStorybookPdf({
    outputPath,
    orientation = 'landscape',
    coverImageUrl,
    coverTitle,
    backCoverImageUrl,
    backCoverBlurb,
    pages = [],
    genre = 'Family',
  }) {
    return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      registerFonts(doc);
      const typography = getPdfTypographyByGenre(genre);
      const size = getPageSize(orientation);

      /* ================= COVER ================= */
      doc.addPage({ size, margins: 0 });
      const { width, height } = doc.page;

      if (coverImageUrl) {
        const img = await loadImageAsBuffer(coverImageUrl);
        doc.image(img, 0, 0, { width, height });
      }

      if (coverTitle) {
        const titleStyle = getTitleTypography(typography);
        const subStyle = getTitleSubTypography(typography);

        const lines = coverTitle.split('\n');
        const mainTitle = lines[0];
        const subTitle = lines[1] || '';

        const boxWidth = width * 0.65;
        const boxX = (width - boxWidth) / 2;
        const boxY = height * 0.38;

        let cursorY = boxY + 32;

        doc.save();
        doc.fillOpacity(0.28).fillColor('#fbfbf8');
        doc.roundedRect(boxX, boxY, boxWidth, 150, 18).fill();
        doc.restore();

        // Main title
        doc
          .font(titleStyle.font)
          .fontSize(titleStyle.size)
          .fillColor('#111827')
          .text(mainTitle, boxX + 40, cursorY, {
            width: boxWidth - 80,
            align: 'center',
            characterSpacing: titleStyle.letterSpacing,
          });

        cursorY += titleStyle.size + 6;

        // Subtitle
        if (subTitle) {
          doc
            .font(subStyle.font)
            .fontSize(subStyle.size)
            .text(subTitle, boxX + 40, cursorY, {
              width: boxWidth - 80,
              align: 'center',
              characterSpacing: subStyle.letterSpacing,
            });
        }
      }

      /* ================= STORY PAGES ================= */
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
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
        doc.font(typography.fontMedium || typography.fontRegular || 'Poppins-Medium');
        doc.fontSize(typography.fontSize || 21);
        const textHeight = doc.heightOfString(cleanText, {
          width: panelWidth - PAGE_LAYOUT.padding * 2,
          characterSpacing: typography.letterSpacing || 0,
        });

        const panelHeight = textHeight + PAGE_LAYOUT.padding * 2;

        doc.save();
        doc.fillOpacity(0.28).fillColor('#fbfbf8');
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

        // Single-pass paragraph render (renderer will compute a safe single-fit scale if needed)
        const ok = renderHtmlToPdf(
          doc,
          page.html,
          panelX + PAGE_LAYOUT.padding,
          panelY + PAGE_LAYOUT.padding,
          panelWidth - PAGE_LAYOUT.padding * 2,
          panelHeight - PAGE_LAYOUT.padding * 2,
          genre,
          1
        );
        if (!ok) {
          // As a fallback, draw an ellipsis if rendering failed (should be rare)
          doc.fillColor('#111827').font('Poppins-Medium').fontSize(12).text('...', panelX + PAGE_LAYOUT.padding, panelY + PAGE_LAYOUT.padding);
        }
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
            doc.fillOpacity(0.28).fillColor('#fbfbf8');
            doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 20).fill();
            doc.restore();

            const blurbStyle = getBackBlurbTypography(typography);

            doc
              .font(blurbStyle.font)
              .fontSize(blurbStyle.size)
              .fillColor('#1f2937')
              .text(backCoverBlurb, boxX + PAGE_LAYOUT.padding, boxY + PAGE_LAYOUT.padding, {
                width: boxWidth - PAGE_LAYOUT.padding * 2,
                align: 'center',
                lineGap: blurbStyle.lineGap,
              });
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
