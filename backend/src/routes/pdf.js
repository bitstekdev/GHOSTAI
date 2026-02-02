const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const Story = require("../models/Story");
const StoryPage = require("../models/StoryPage");
const { generateStorybookPdf } = require('../pdf/fonts/generateStorybookPdf');

const tempDir = path.join(os.tmpdir(), 'ghostai-pdfs');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ======================================================
// OPTIMIZED PDF GENERATION ENDPOINT
// ======================================================
router.post('/generate-pdf', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { storyId } = req.body;

    if (!storyId) {
      return res.status(400).json({ error: 'Missing storyId' });
    }

    console.log(`[PDF] Starting generation for story: ${storyId}`);

    // ✅ OPTIMIZED: Single query with lean() and only needed fields
    const story = await Story.findById(storyId)
      .select('title genres numOfPages orientation coverImage backCoverImage backCoverBlurb status step')
      .populate('coverImage', 's3Url')
      .populate('backCoverImage', 's3Url')
      .lean()
      .exec();

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    console.log(`[PDF] Story fetched in ${Date.now() - startTime}ms`);

    // ✅ OPTIMIZED: Parallel fetch of pages with only needed fields
    const pagesStartTime = Date.now();
    const storyPages = await StoryPage.find({ story: storyId })
      .select('pageNumber text html characterImage backgroundImage finalCompositeImage')
      .sort({ pageNumber: 1 })
      .populate('characterImage', 's3Url')
      .populate('backgroundImage', 's3Url')
      .populate('finalCompositeImage', 's3Url')
      .lean()
      .exec();

    console.log(`[PDF] Pages fetched in ${Date.now() - pagesStartTime}ms (${storyPages.length} pages)`);

    // ✅ PREPARE PDF METADATA
    const orientation = (story.orientation || 'Portrait').toLowerCase();
    const title = (story.title || 'storybook')
      .replace(/[^a-z0-9\-_. ]/gi, '')
      .trim();

    const pdfFileName = `${title}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const pdfPath = path.join(tempDir, pdfFileName);

    // ✅ OPTIMIZED: Fast page transformation
    let pdfPages = [];

    if (storyPages.length > 0) {
      pdfPages = storyPages.map((page) => {
        const mainImage = page.finalCompositeImage || page.characterImage;
        
        return {
          imageUrl: mainImage?.s3Url || null,
          backgroundImageUrl: page.backgroundImage?.s3Url || null,
          useOverlay: false,
          html: page.html || `<p>${escapeHtml(page.text || '')}</p>`,
        };
      });
    } else {
      // ⚠️ FALLBACK: Minimal placeholder pages
      const numPages = Math.min(story.numOfPages || 10, 20); // Cap at 20 pages max
      
      for (let i = 1; i <= numPages; i++) {
        pdfPages.push({
          imageUrl: null,
          backgroundImageUrl: null,
          useOverlay: false,
          html: `<div style="text-align:center;padding:40px;"><h2>${escapeHtml(story.title || 'Story')}</h2><p>Page ${i}</p><p style="color:#999;">Content pending</p></div>`,
        });
      }
    }

    console.log(`[PDF] Starting PDF generation with ${pdfPages.length} pages`);
    const pdfStartTime = Date.now();

    // ✅ GENERATE PDF
    await generateStorybookPdf({
      outputPath: pdfPath,
      orientation,
      genre: story.genres?.[0] || 'Family',
      coverImageUrl: story.coverImage?.s3Url || null,
      coverTitle: story.title || 'Untitled Story',
      backCoverImageUrl: story.backCoverImage?.s3Url || null,
      backCoverBlurb: story.backCoverBlurb || '',
      pages: pdfPages,
      textColor: 'black',
    });

    console.log(`[PDF] PDF generated in ${Date.now() - pdfStartTime}ms`);
    console.log(`[PDF] Total time: ${Date.now() - startTime}ms`);

    // ✅ STREAM PDF IMMEDIATELY
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

    const pdfStream = fs.createReadStream(pdfPath);
    pdfStream.pipe(res);

    pdfStream.on('end', () => {
      fs.unlink(pdfPath, () => {});
    });

    pdfStream.on('error', (err) => {
      console.error('[PDF] Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream PDF' });
      }
    });

  } catch (err) {
    console.error('[PDF] Generation error:', err);
    console.error(`[PDF] Failed after ${Date.now() - startTime}ms`);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate PDF',
        details: err.message,
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