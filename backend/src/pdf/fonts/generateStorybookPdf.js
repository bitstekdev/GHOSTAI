const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const { getPdfTypographyByGenre, resolveTextStyle, isPoetry } = require('./pdfTypography');

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
   HELPER: SEEDED RANDOM (deterministic per PDF)
====================================================== */
function seededRandom(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13; h ^= h >>> 7;
    h += h << 3;  h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

/* ======================================================
   HELPER: DETECT DARK IMAGE (simple luminance check)
====================================================== */
async function isDarkImage(buffer) {
  try {
    // Quick heuristic: check buffer for dark pixels
    // For JPEG/PNG, we'd need image parsing; for now use a simple check
    // This is a placeholder — in production, use sharp or similar
    return false; // Conservative default: assume light background
  } catch (e) {
    return false;
  }
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

  // Fredoka (Playful display font for kids' covers)
  try {
    doc.registerFont('Fredoka-Bold', path.join(fontsDir, 'Fredoka-Bold.ttf'));
  } catch (e) {
    // If Fredoka isn't available, fall back to other fonts
  }

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

// Helpers: derive display styles using typography scale
function getTitleTypography(genreTypography, isKids = true) {
  const scaleKey = isKids ? 'cover_title_kids' : 'cover_title';
  
  return {
    font: genreTypography.fontDisplay || genreTypography.fontBold || genreTypography.fontMedium,
    ...resolveTextStyle(scaleKey, genreTypography),
  };
}

function getTitleSubTypography(genreTypography) {
  return {
    font: genreTypography.fontMedium || genreTypography.fontRegular,
    ...resolveTextStyle('cover_subtitle', genreTypography),
  };
}

function getBackBlurbTypography(genreTypography) {
  return {
    font: genreTypography.fontRegular,
    ...resolveTextStyle('back_blurb', genreTypography),
  };
}

/* ======================================================
   LYRICAL HEIGHT CALCULATOR (for manual line rendering)
====================================================== */
function measureLyricalHeight(text, style) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return lines.length * style.lineHeight;
}

/* ======================================================
   POETRY: MANUALLY CENTERED LINES (optical centering)
====================================================== */
function renderPoetryLines(doc, text, x, y, maxWidth, style, fontName, textColor) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  doc.font(fontName).fontSize(style.size).fillColor(textColor);

  let cursorY = y;
  const lineHeight = style.lineHeight;

  for (const line of lines) {
    const lineWidth = doc.widthOfString(line);
    const lineX = x + (maxWidth - lineWidth) / 2;

    doc.text(line, lineX, cursorY, {
      lineBreak: false,
    });

    cursorY += lineHeight;
  }
}

/* ======================================================
   LYRICAL STORY: FORMAT TEXT INTO INTENTIONAL LINES
====================================================== */
function formatStoryAsLines(text, maxChars = 42) {
  // Split by deliberate line breaks first (preserve stanzas)
  const stanzas = text.split(/\n\n+/);

  const formatted = stanzas.map(stanza => {
    const words = stanza.replace(/\r\n/g, '\n').split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = (currentLine + (currentLine ? ' ' : '') + word).trim();
      
      if (testLine.length > maxChars && currentLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines.join('\n');
  }).join('\n\n');

  return formatted;
}

/* ======================================================
   SHARED CENTERED TEXT CONTAINER (Story + Back Cover)
====================================================== */
function getCenteredTextContainer(doc, content, typography, scaleKey, align = 'center') {
  const boxWidth = doc.page.width * 0.7;
  const boxX = (doc.page.width - boxWidth) / 2;

  const textStyle = resolveTextStyle(scaleKey, typography);
  doc.font(typography.fontRegular || typography.fontMedium).fontSize(textStyle.size);

  let textHeight;

  if (align === 'center' && content.includes('\n')) {
    // Lyrical / poetry mode — manual line rendering (measure actual line count)
    textHeight = measureLyricalHeight(content, textStyle);
  } else {
    // Paragraph mode — use PDFKit's paragraph measurement
    textHeight = doc.heightOfString(content, {
      width: boxWidth - PAGE_LAYOUT.padding * 2,
      align,
      characterSpacing: textStyle.letterSpacing || 0,
    });
  }

  const boxHeight = textHeight + PAGE_LAYOUT.padding * 2;
  
  // Math centering + optical downward bias (professional typography trick)
  // Centered text looks slightly high to the eye, so bias down by ~35% of line height
  const opticalOffset = Math.floor(textStyle.lineHeight * 0.35);
  const boxY = (doc.page.height - boxHeight) / 2 + opticalOffset;

  return {
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    textX: boxX + PAGE_LAYOUT.padding,
    textY: boxY + PAGE_LAYOUT.padding,
    textWidth: boxWidth - PAGE_LAYOUT.padding * 2,
    textStyle,
  };
}

/* ======================================================
   HTML → PDF WORD-LEVEL RENDERER (FIXED)
====================================================== */
function renderHtmlToPdf(doc, html, startX, startY, maxWidth, maxHeight, genre = 'Family', fontScale = 1, textColor = '#111827', scaleKey = 'body', align = 'left') {
  // Paragraph-based renderer: preserves shaping/kerning and avoids per-word drawing.
  // This intentionally does not apply characterSpacing to body text (books look
  // best with 0 extra spacing). Inline highlights are ignored to keep a single
  // render pass; if needed we can implement run-based continued text later.
  const root = parse(html);
  const p = root.querySelector('p');
  if (!p) return false;

  const typography = getPdfTypographyByGenre(genre);
  
  // Resolve typography scale for this content type
  const textStyle = resolveTextStyle(scaleKey, typography);

  // Use scale-determined sizes adjusted by fontScale
  const effectiveFontSize = textStyle.size * fontScale;
  const effectiveLineHeight = textStyle.lineHeight * fontScale;
  const effectiveLetterSpacing = textStyle.letterSpacing || 0;

  const fontName = typography.fontRegular || typography.fontMedium || 'Poppins-Medium';

  doc.font(fontName).fontSize(effectiveFontSize);

  const lineGap = Math.max(0, effectiveLineHeight - effectiveFontSize);

  // Preserve line breaks for poetry and prose rhythm (do NOT collapse whitespace)
  const cleanText = (p.textContent || p.text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  // Measure how tall the paragraph would be with these settings
  const measureOptions = {
    width: maxWidth,
    characterSpacing: effectiveLetterSpacing,
    lineGap,
    align,
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
      'highlight-action': { font: typography.fontMedium || typography.fontRegular, fillColor: textColor },
      'highlight-emotion': { font: typography.fontItalic || typography.fontRegular, fillColor: '#3f6b4f' },
      'highlight-emphasis': { font: typography.fontBold || typography.fontMedium, fillColor: textColor },
    };

    const renderRuns = (fontSizeToUse, lineGapToUse) => {
      let firstChunk = true;
      const nodes = p.childNodes && p.childNodes.length ? p.childNodes : [{ nodeType: 3, rawText: p.text }];

      for (const node of nodes) {
        const text = (node.rawText || node.text || node.textContent || '').replace(/\s+/g, ' ');
        if (!text) continue;

        let runFont = fontName;
        let runColor = textColor;

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
          doc.text(text, startX, startY, { width: maxWidth, continued: true, lineGap: lineGapToUse, characterSpacing: 0, align });
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
    'highlight-action': { font: typography.fontMedium || typography.fontRegular, fillColor: textColor },
    'highlight-emotion': { font: typography.fontItalic || typography.fontRegular, fillColor: '#3f6b4f' },
    'highlight-emphasis': { font: typography.fontBold || typography.fontMedium, fillColor: textColor },
  };

  let firstChunk = true;
  const nodes = p.childNodes && p.childNodes.length ? p.childNodes : [{ nodeType: 3, rawText: p.text }];

  for (const node of nodes) {
    const text = (node.rawText || node.text || node.textContent || '').replace(/\s+/g, ' ');
    if (!text) continue;

    let runFont = fontName;
    let runColor = textColor;

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
      doc.text(text, startX, startY, { width: maxWidth, continued: true, lineGap, characterSpacing: 0, align });
      firstChunk = false;
    } else {
      doc.text(text, { continued: true });
    }
  }

  // finish paragraph
  doc.text('', { continued: false });

  return true;
}

/* ======================================================
   FULL-BLEED IMAGE PAGE (no overlays, no text)
====================================================== */
async function renderImagePage(doc, page, size) {
  doc.addPage({ size, margins: 0 });

  if (!page.imageUrl) return;

  const img = await loadImageAsBuffer(page.imageUrl);
  doc.image(img, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
}

/* ======================================================
   TEXT PAGE WITH BACKGROUND (auto text color detection)
====================================================== */
async function renderTextPage(doc, page, size, genre = 'Family', defaultTextColor = '#111827') {
  doc.addPage({ size, margins: 0 });

  // Render background image if present
  if (page.backgroundImageUrl) {
    const bg = await loadImageAsBuffer(page.backgroundImageUrl);
    doc.image(bg, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });
  }

  // Determine text color (use override from page or parameter)
  let textColor = page.textColor || defaultTextColor;

  // Optional: auto-detect dark backgrounds (fallback to isDarkImage check)
  if (page.backgroundImageUrl && textColor === defaultTextColor) {
    const bg = await loadImageAsBuffer(page.backgroundImageUrl);
    if (await isDarkImage(bg)) {
      textColor = '#ffffff';
    }
  }

  // Detect if this is poetry
  const detectPoetry = isPoetry(page.html);

  // Get text panel layout
  const typography = getPdfTypographyByGenre(genre);
  const rawText = page.html.replace(/<[^>]*>/g, '');
  
  // All story content is lyrical: formatted into intentional lines and optically centered
  // Poetry detection adds extra line breathing room
  const scaleKey = detectPoetry ? 'poetry' : 'poetry'; // Both use poetry scale for lyrical rendering
  const style = resolveTextStyle(scaleKey, typography);
  const fontName = typography.fontRegular;

  // Format text into intentional short lines (book-style)
  const lyricalText = formatStoryAsLines(rawText, 42);

  const container = getCenteredTextContainer(doc, lyricalText, typography, scaleKey, 'center');

  // Optional panel background (conditional)
  if (page.useOverlay !== false) {
    doc.save();
    doc.fillOpacity(0.28).fillColor('#fbfbf8');
    doc.roundedRect(container.boxX, container.boxY, container.boxWidth, container.boxHeight, 20).fill();
    doc.restore();
  }

  // Render all story content as lyrical (manually centered lines with optical centering)
  renderPoetryLines(
    doc,
    lyricalText,
    container.textX,
    container.textY,
    container.textWidth,
    style,
    fontName,
    textColor
  );
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
    textColor = 'black',
  }) {
    return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      registerFonts(doc);
      const typography = getPdfTypographyByGenre(genre);
      const size = getPageSize(orientation);
      
      // Normalize text color to hex
      const textColorHex = textColor === 'white' || textColor === '#ffffff'
        ? '#ffffff'
        : '#111827';

      /* ================= COVER ================= */
      doc.addPage({ size, margins: 0 });
      const { width, height } = doc.page;

      if (coverImageUrl) {
        const img = await loadImageAsBuffer(coverImageUrl);
        doc.image(img, 0, 0, { width, height });
      }

      if (coverTitle) {
        const titleStyle = getTitleTypography(typography, true);  // isKids=true for playful display
        const subStyle = getTitleSubTypography(typography);

        const lines = coverTitle.split('\n');
        const mainTitle = lines[0];
        const subTitle = lines[1] || '';

        const boxWidth = width * 0.65;
        const boxX = (width - boxWidth) / 2;
        const boxY = height * 0.38;

        let cursorY = boxY;

        // Main title (no background container - illustration-first design)
        doc
          .font(titleStyle.font)
          .fontSize(titleStyle.size)
          .fillColor(textColorHex)
          .text(mainTitle, boxX, cursorY, {
            width: boxWidth,
            align: 'center',
            characterSpacing: titleStyle.letterSpacing,
          });

        cursorY += titleStyle.size + 10;

        // Subtitle
        if (subTitle) {
          doc
            .font(subStyle.font)
            .fontSize(subStyle.size)
            .fillColor(textColorHex)
            .text(subTitle, boxX, cursorY, {
              width: boxWidth,
              align: 'center',
              characterSpacing: subStyle.letterSpacing,
            });
        }
      }

      /* ================= STORY PAGES ================= */
      // Create seeded random generator for deterministic randomization
      const rand = seededRandom(outputPath);
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        
        // Randomly decide page order: 50% image first, 50% text first
        const imageFirst = rand() > 0.5;
        
        if (imageFirst) {
          // IMAGE PAGE → TEXT PAGE
          await renderImagePage(doc, page, size);
          await renderTextPage(doc, page, size, genre, textColorHex);
        } else {
          // TEXT PAGE → IMAGE PAGE
          await renderTextPage(doc, page, size, genre, textColorHex);
          await renderImagePage(doc, page, size);
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

          // Use typography scale for back cover blurb
          const blurbStyle = getBackBlurbTypography(typography);
          
          doc.font(blurbStyle.font).fontSize(blurbStyle.size);
          const textHeight = doc.heightOfString(backCoverBlurb, {
            width: boxWidth - PAGE_LAYOUT.padding * 2,
            align: 'center',
            characterSpacing: blurbStyle.letterSpacing || 0,
          });

          const boxHeight = textHeight + PAGE_LAYOUT.padding * 2;
          const boxY = qrY - boxHeight - 24;

            doc.save();
            doc.fillOpacity(0.28).fillColor('#fbfbf8');
            doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 20).fill();
            doc.restore();

            doc
              .font(blurbStyle.font)
              .fontSize(blurbStyle.size)
              .fillColor(textColorHex)
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
