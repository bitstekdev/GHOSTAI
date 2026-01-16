// pdfTypography.js

/* ======================================================
   TYPOGRAPHY SCALE (immutable API)
   Single source of truth for all font sizing & hierarchy
====================================================== */
const TYPOGRAPHY_SCALE = {
  // COVER & DISPLAY
  cover_title: {
    sizeRatio: 1.76,      // 21 × 1.76 = 37pt
    lineHeightRatio: 1.2,
    letterSpacingAdd: 0.6,
    weight: 'bold',
  },
  cover_title_kids: {
    sizeRatio: 3.0,       // 21 × 3.0 = 63pt (playful, large)
    lineHeightRatio: 1.05,
    letterSpacingAdd: 0.2,
    weight: 'bold',
  },
  cover_subtitle: {
    sizeRatio: 1.28,      // 21 × 1.28 = 27pt
    lineHeightRatio: 1.3,
    letterSpacingAdd: 0.4,
    weight: 'medium',
  },
  
  // BODY TEXT (primary)
  body: {
    sizeRatio: 1.0,       // 21pt (base)
    lineHeightRatio: 1.62, // 34pt line height
    letterSpacingAdd: 0,
    weight: 'regular',
  },
  
  // SEMANTIC VARIANTS
  opening_line: {
    sizeRatio: 1.1,       // 23pt - slightly larger to signal start
    lineHeightRatio: 1.62,
    letterSpacingAdd: 0.1,
    weight: 'medium',
    styleHint: 'italic',
  },
  
  emphasis: {
    sizeRatio: 1.0,
    lineHeightRatio: 1.62,
    letterSpacingAdd: 0,
    weight: 'bold',
  },
  
  poetry: {
    sizeRatio: 0.95,      // Slightly smaller for verse
    lineHeightRatio: 1.8,  // Extra line height for breathing
    letterSpacingAdd: 0.2,
    weight: 'regular',
    alignHint: 'center',
  },
  
  // BACK COVER
  back_blurb: {
    sizeRatio: 0.95,      // 19pt
    lineHeightRatio: 1.5,
    letterSpacingAdd: 0.15,
    weight: 'regular',
    alignHint: 'center',
  },
  
  back_blurb_title: {
    sizeRatio: 1.2,
    lineHeightRatio: 1.4,
    letterSpacingAdd: 0.3,
    weight: 'bold',
    alignHint: 'center',
  },
};

/* ======================================================
   GENRE FONT DEFINITIONS (immutable)
====================================================== */
const PDF_GENRE_STYLES = {
  Family: {
    fontRegular: 'Alegreya-Regular',
    fontMedium: 'Alegreya-Medium',
    fontBold: 'Alegreya-Bold',
    fontItalic: 'Alegreya-Italic',
    fontDisplay: 'Fredoka-Bold',  // Playful display font for kids' covers
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  Fantasy: {
    fontRegular: 'CormorantGaramond-Regular',
    fontMedium: 'CormorantGaramond-Regular',
    fontBold: 'CormorantGaramond-Bold',
    fontItalic: 'CormorantGaramond-Italic',
    fontDisplay: 'CormorantGaramond-Bold', // elegant fantasy
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.45,
  },
  Adventure: {
    fontRegular: 'LibreBaskerville-Regular',
    fontMedium: 'LibreBaskerville-Regular',
    fontBold: 'LibreBaskerville-Bold',
    fontItalic: 'LibreBaskerville-Italic',
    fontDisplay: 'LibreBaskerville-Bold', // strong classic
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.25,
  },
  Mystery: {
    fontRegular: 'CrimsonText-Regular',
    fontMedium: 'CrimsonText-Regular',
    fontBold: 'CrimsonText-Bold',
    fontItalic: 'CrimsonText-Italic',
    fontDisplay: 'CrimsonText-Bold', // moody
    fontSize: 21,
    lineHeight: 33,
    letterSpacing: 0.35,
  },
  'Sci-Fi': {
    fontRegular: 'SourceSerif4-Regular',
    fontMedium: 'SourceSerif4-Regular',
    fontBold: 'SourceSerif4-Bold',
    fontItalic: 'SourceSerif4-Italic',
    fontDisplay: 'SourceSerif4-Bold', // modern
    fontSize: 21,
    lineHeight: 33,
    letterSpacing: 0.4,
  },
  Marriage: {
    fontRegular: 'PlayfairDisplay-Regular',
    fontMedium: 'PlayfairDisplay-Regular',
    fontBold: 'PlayfairDisplay-Bold',
    fontItalic: 'PlayfairDisplay-Italic',
    fontDisplay: 'PlayfairDisplay-Bold', // romantic
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.5,
  },
};

/* ======================================================
   RESOLVER: Typography Scale + Genre → Computed Style
====================================================== */
function resolveTextStyle(scaleKey, genreTypography = {}) {
  const scale = TYPOGRAPHY_SCALE[scaleKey];
  
  if (!scale) {
    console.warn(`Unknown scale key: ${scaleKey}, falling back to body`);
    return resolveTextStyle('body', genreTypography);
  }
  
  const baseFontSize = genreTypography.fontSize || 21;
  const baseLineHeight = genreTypography.lineHeight || 34;
  const baseLetterSpacing = genreTypography.letterSpacing || 0;
  
  return {
    size: Math.floor(baseFontSize * scale.sizeRatio),
    lineHeight: Math.floor(baseLineHeight * scale.lineHeightRatio),
    letterSpacing: baseLetterSpacing + scale.letterSpacingAdd,
    weight: scale.weight,
    style: scale.styleHint,
    align: scale.alignHint,
  };
}

function getPdfTypographyByGenre(genre) {
  return PDF_GENRE_STYLES[genre] || PDF_GENRE_STYLES.Family;
}

/* ======================================================
   POETRY DETECTION (heuristic)
   Identifies verse blocks for special styling
====================================================== */
function isPoetry(htmlString) {
  if (!htmlString) return false;
  
  // Extract clean text
  const cleanText = htmlString.replace(/<[^>]*>/g, '').trim();
  const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
  
  // Heuristics:
  // 1. Multiple short lines (poetry rarely exceeds 70 chars per line)
  // 2. Line count > 3 (at least a stanza)
  // 3. Consistent indentation suggests verse
  
  if (lines.length < 3) return false;
  
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
  const shortLineCount = lines.filter(l => l.trim().length < 70).length;
  const shortLineRatio = shortLineCount / lines.length;
  
  // If most lines are short (typical for poetry) and it's formatted as multiple lines
  return avgLineLength < 60 && shortLineRatio > 0.7;
}

module.exports = {
  TYPOGRAPHY_SCALE,
  PDF_GENRE_STYLES,
  getPdfTypographyByGenre,
  resolveTextStyle,
  isPoetry,
};

