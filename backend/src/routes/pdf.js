const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const { generateStorybookPdf } = require('../pdf/fonts/generateStorybookPdf');

// ======================================================
// TEMPORARY PDF STORAGE (cleaned up after download)
// ======================================================

const tempDir = path.join(os.tmpdir(), 'ghostai-pdfs');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ======================================================
// PDF GENERATION ENDPOINT
// ======================================================

router.post('/generate-pdf', async (req, res) => {
  const { storyData } = req.body;

  if (!storyData) {
    return res.status(400).json({ error: 'Missing storyData' });
  }

  const orientation =
    ((storyData.story && storyData.story.orientation) || 'landscape').toLowerCase();

  const title = (storyData.story?.title || 'story')
    .replace(/[^a-z0-9\-_. ]/gi, '')
    .trim();

  // Generate unique filename
  const pdfFileName = `${title}_${crypto.randomBytes(4).toString('hex')}.pdf`;
  const pdfPath = path.join(tempDir, pdfFileName);

  try {
    // Prepare pages data
    const pages = (storyData.pages || []).map(page => ({
      imageUrl: page.characterImage?.s3Url,
      backgroundImageUrl: page.backgroundImage?.s3Url,
      html:
        page.html ||
        `<p>${escapeHtml(page.text || '')}</p>`
    }));

    // Generate PDF
    await generateStorybookPdf({
      outputPath: pdfPath,
      orientation,
      genre: storyData.story?.genre || 'Family',
      coverImageUrl: storyData.story?.coverImage?.s3Url,
      coverTitle: storyData.story?.title || '',
      backCoverImageUrl: storyData.story?.backCoverImage?.s3Url,
      backCoverBlurb: storyData.story?.backCoverBlurb || '',
      pages
    });

    // Send PDF to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${title}.pdf"`
    );

    const pdfStream = fs.createReadStream(pdfPath);
    pdfStream.pipe(res);

    // Cleanup after streaming
    pdfStream.on('end', () => {
      fs.unlink(pdfPath, err => {
        if (err) {
          console.warn(`Failed to clean up PDF: ${pdfPath}`, err);
        }
      });
    });

    pdfStream.on('error', err => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream PDF' });
      }
    });

  } catch (err) {
    console.error('PDF generation error:', err);

    // Cleanup failed PDF if it exists
    fs.unlink(pdfPath, unlinkErr => {
      if (unlinkErr) {
        console.warn(`Failed to clean up failed PDF: ${pdfPath}`);
      }
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate PDF',
        details: err.message
      });
    }
  }
});

// ======================================================
// UTILS
// ======================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = router;