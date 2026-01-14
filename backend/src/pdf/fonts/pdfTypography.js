// pdfTypography.js
const PDF_GENRE_STYLES = {
  Family: {
    fontRegular: 'Alegreya-Regular',
    fontMedium: 'Alegreya-Medium',
    fontBold: 'Alegreya-Bold',
    fontItalic: 'Alegreya-Italic',
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  Fantasy: {
    fontRegular: 'CormorantGaramond-Regular',
    fontMedium: 'CormorantGaramond-Regular',
    fontBold: 'CormorantGaramond-Bold',
    fontItalic: 'CormorantGaramond-Italic',
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.45,
  },
  Adventure: {
    fontRegular: 'LibreBaskerville-Regular',
    fontMedium: 'LibreBaskerville-Regular',
    fontBold: 'LibreBaskerville-Bold',
    fontItalic: 'LibreBaskerville-Italic',
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.25,
  },
  Mystery: {
    fontRegular: 'CrimsonText-Regular',
    fontMedium: 'CrimsonText-Regular',
    fontBold: 'CrimsonText-Bold',
    fontItalic: 'CrimsonText-Italic',
    fontSize: 21,
    lineHeight: 33,
    letterSpacing: 0.35,
  },
  'Sci-Fi': {
    fontRegular: 'SourceSerif4-Regular',
    fontMedium: 'SourceSerif4-Regular',
    fontBold: 'SourceSerif4-Bold',
    fontItalic: 'SourceSerif4-Italic',
    fontSize: 21,
    lineHeight: 33,
    letterSpacing: 0.4,
  },
  Marriage: {
    fontRegular: 'PlayfairDisplay-Regular',
    fontMedium: 'PlayfairDisplay-Regular',
    fontBold: 'PlayfairDisplay-Bold',
    fontItalic: 'PlayfairDisplay-Italic',
    fontSize: 21,
    lineHeight: 34,
    letterSpacing: 0.5,
  },
};

function getPdfTypographyByGenre(genre) {
  return PDF_GENRE_STYLES[genre] || PDF_GENRE_STYLES.Family;
}

module.exports = { getPdfTypographyByGenre, PDF_GENRE_STYLES };
