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
// PDF GENERATION ENDPOINT (ADMIN - ALWAYS GENERATES)
// ======================================================
router.post('/generate-pdf', async (req, res) => {
  try {
    const { storyId } = req.body;

    if (!storyId) {
      return res.status(400).json({ error: 'Missing storyId' });
    }

    // ✅ FETCH STORY
    const story = await Story.findById(storyId)
      .populate('coverImage')
      .populate('backCoverImage')
      .lean();

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // ✅ FETCH PAGES
    const storyPages = await StoryPage.find({ story: storyId })
      .sort({ pageNumber: 1 })
      .populate('characterImage')
      .populate('backgroundImage')
      .populate('finalCompositeImage')
      .lean();

    console.log('================ PDF GENERATION =================');
    console.log('Story ID:', storyId);
    console.log('Story Title:', story.title);
    console.log('Story Status:', story.status);
    console.log('Story Step:', story.step);
    console.log('Pages Found:', storyPages.length);
    console.log('Expected Pages:', story.numOfPages);
    console.log('================================================');

    // ✅ PREPARE PDF METADATA
    const orientation = (story.orientation || 'Portrait').toLowerCase();
    const title = (story.title || 'storybook')
      .replace(/[^a-z0-9\-_. ]/gi, '')
      .trim();

    const pdfFileName = `${title}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const pdfPath = path.join(tempDir, pdfFileName);

    // ✅ GENERATE PAGES (with fallback for incomplete stories)
    let pdfPages = [];

    if (storyPages.length > 0) {
      // Use actual story pages
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
      // ⚠️ FALLBACK: Generate placeholder pages for printing
      console.warn('No pages found - generating placeholder pages');
      
      const numPages = story.numOfPages || 10;
      
      for (let i = 1; i <= numPages; i++) {
        pdfPages.push({
          imageUrl: null,
          backgroundImageUrl: null,
          useOverlay: false,
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              text-align: center;
              padding: 40px;
              font-family: Arial, sans-serif;
            ">
              <h2 style="color: #6b46c1; margin-bottom: 20px;">
                ${escapeHtml(story.title || 'Story')}
              </h2>
              <p style="color: #666; font-size: 18px; margin-bottom: 10px;">
                Page ${i}
              </p>
              <p style="color: #999; font-size: 14px;">
                Story content will be generated soon
              </p>
              ${story.status === 'draft' ? `
                <p style="color: #f59e0b; font-size: 12px; margin-top: 20px;">
                  Status: Draft (Step ${story.step}/4)
                </p>
              ` : ''}
            </div>
          `,
        });
      }
    }

    // ✅ GENERATE PDF
    await generateStorybookPdf({
      outputPath: pdfPath,
      orientation,
      genre: story.genres?.[0] || 'Family',
      coverImageUrl: story.coverImage?.s3Url || null,
      coverTitle: story.title || 'Untitled Story',
      backCoverImageUrl: story.backCoverImage?.s3Url || null,
      backCoverBlurb: story.backCoverBlurb || 'A wonderful story awaits...',
      pages: pdfPages,
      textColor: 'black',
    });

    console.log('✅ PDF Generated:', pdfPath);

    // ✅ SEND PDF TO CLIENT
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${title}.pdf"`
    );

    const pdfStream = fs.createReadStream(pdfPath);
    pdfStream.pipe(res);

    pdfStream.on('end', () => {
      fs.unlink(pdfPath, (err) => {
        if (err) console.warn('Failed to clean up PDF:', err);
      });
    });

    pdfStream.on('error', (err) => {
      console.error('PDF Stream Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream PDF' });
      }
    });

  } catch (err) {
    console.error('PDF Generation Error:', err);

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