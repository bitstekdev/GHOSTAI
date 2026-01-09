const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const crypto = require('crypto');

// Dev / build flags
const DEV_NO_BROWSER_REUSE = process.env.PDF_DEV_NO_BROWSER_REUSE === 'true';
const INCLUDE_BUILD_BANNER = (process.env.PDF_INCLUDE_BUILD_BANNER === 'true') || (process.env.NODE_ENV !== 'production');
const BUILD_HASH = process.env.BUILD_HASH || crypto.createHash('sha1').update(String(Date.now())).digest('hex').slice(0, 8);

// Module-scoped browser instance to reuse Chromium across requests
let _browserInstance = null;
async function getBrowser() {
  try {
    if (_browserInstance && _browserInstance.isConnected && _browserInstance.isConnected()) {
      return _browserInstance;
    }
  } catch (e) {
    _browserInstance = null;
  }

  _browserInstance = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // close browser on process exit
  process.once('exit', async () => {
    try {
      if (_browserInstance) await _browserInstance.close();
    } catch (e) {}
  });

  return _browserInstance;
}

router.post('/generate-pdf', async (req, res) => {
  const { storyData } = req.body;

  if (!storyData) {
    return res.status(400).json({ error: 'Missing storyData' });
  }

  // Determine page sizing based on story orientation
  const PAGE_SIZES = {
    Portrait:  { widthPx: 794,  heightPx: 1123, widthMm: '210mm', heightMm: '297mm' },
    Landscape: { widthPx: 1123, heightPx: 794,  widthMm: '297mm', heightMm: '210mm' },
    Square:    { widthPx: 1000, heightPx: 1000, widthMm: '210mm', heightMm: '210mm' }
  };

  const orientation = (storyData.story && storyData.story.orientation) || 'Portrait';
  const pageSize = PAGE_SIZES[orientation] || PAGE_SIZES.Portrait;

  let page;
  let browser;
  let createdBrowserForRequest = false;
  try {
    if (DEV_NO_BROWSER_REUSE) {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      createdBrowserForRequest = true;
    } else {
      browser = await getBrowser();
    }

    page = await browser.newPage();

    // Do not set viewport for PDF rendering — prefer CSS @page sizes instead

    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    const html = generateBookHTML(storyData, pageSize.widthMm, pageSize.heightMm);

    // Wait for DOM ready (avoid networkidle0 traps on slow S3)
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Ensure images are loaded with a hard cap to avoid hanging
    try {
      await page.evaluate(async () => {
        const imgs = Array.from(document.images || []);
        await Promise.race([
          Promise.all(
            imgs.map(img =>
              img.complete
                ? Promise.resolve()
                : new Promise(res => {
                    img.onload = img.onerror = res;
                  })
            )
          ),
          new Promise(res => setTimeout(res, 8000))
        ]);
      });
    } catch (e) {
      console.debug('Image wait failed', e);
    }

    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 }
      });
    } catch (err) {
      console.error('PDF render failed:', err);
      throw err;
    }

    // Debug: log signature and size to verify buffer integrity
    try {
      console.log('PDF signature:', pdfBuffer.slice(0, 5).toString());
    } catch (e) {
      console.debug('Unable to read PDF signature', e);
    }
    console.log('PDF size (bytes):', pdfBuffer.length);

    // Ensure proxy/compression won't mangle the binary
    res.setHeader('Content-Encoding', 'identity');
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${(storyData.story?.title || 'story').replace(/[^a-z0-9\-_. ]/gi, '')}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    try {
      if (page) await page.close();
      if (createdBrowserForRequest && browser) {
        try {
          await browser.close();
        } catch (e) {
          console.debug('Failed to close per-request browser:', e);
        }
      }
    } catch (e) {
      console.debug('Failed to close page:', e);
    }
  }
});

module.exports = router;

// ---------------- HTML TEMPLATE ----------------
function generateBookHTML(storyData, widthMm = '210mm', heightMm = '297mm') {
  const story = storyData.story || {};
  const pages = storyData.pages || [];

  // base href helps resolve relative dev assets if any
  const baseHref = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <base href="${baseHref}">
    <style>
      @page { size: ${widthMm} ${heightMm}; margin: 0; }
      html,body{ margin:0; padding:0; height:100%; width:100%; font-family: Arial, Helvetica, sans-serif; }

      .pdf-page { width: ${widthMm}; height: ${heightMm}; page-break-after: always; position: relative; overflow: hidden; margin:0; padding:0; }

      /* Overlay text pattern: text floats above background without affecting layout.
        Use bottom-anchored bounded area to guarantee printable safety. */
      .overlay-text { position: absolute; left: 15mm; right: 15mm; bottom: 18mm; top: auto; display:flex; align-items:center; justify-content:center; box-sizing: border-box; z-index: 2; }
      .overlay-text > * { background: rgba(255,255,255,0.85); padding: 6mm 8mm; border-radius: 6px; color: #111; max-width: 100%; }

      .image-page { padding: 0; } /* Full-image pages: pure image fills whole page edge-to-edge (default: contain to avoid cropping). Use per-page fullBleed to switch to cover when intended. */
      .image-page img.full-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; }
      .image-page.full-bleed img.full-image { object-fit: cover; }

      /* Text/background page (right): background fills page using background-image.
        Default to contain (no crop); switched to cover when fullBleed is requested or auto-detect matches. */
      .text-page .bg { position:absolute; inset:0; width:100%; height:100%; background-size: contain; background-position: center; background-repeat: no-repeat; filter: brightness(0.96); }
      .text-page.full-bleed .bg { background-size: cover; }

      /* Back-cover overlay */
      .back-cover { position: relative; }
      .back-cover .bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position: center; z-index: 0; }
      .back-cover .back-text { position:absolute; left:15mm; right:15mm; bottom:18mm; top:auto; display:flex; align-items:center; justify-content:center; box-sizing:border-box; z-index:2; }

      img{ max-width:100%; max-height:100%; }
      /* Build banner for provenance/debugging */
      .build-banner { position: fixed; top: 4mm; left: 4mm; background: rgba(200,20,20,0.95); color: #fff; padding: 2mm 4mm; font-size: 9pt; z-index: 99999; border-radius: 4px; font-family: monospace; }
    </style>
  </head>
  <body>

    ${INCLUDE_BUILD_BANNER ? `<div class="build-banner">BUILD ${BUILD_HASH} — ${new Date().toISOString()}</div>` : ''}

    <!-- COVER (background-image to allow full-bleed and text overlay) -->
    <div class="pdf-page cover-page" style="background-image: url('${story.coverImage?.s3Url || ''}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
      <div class="overlay-text" style="position:absolute; left:12mm; right:12mm; top:12mm; text-align:center;">
        <div style="display:inline-block; background: rgba(0,0,0,0.45); color:#fff; padding:8mm 12mm; border-radius:6px;">${escapeHtml(story.title || '')}</div>
      </div>
    </div>

    ${pages.map(p => `
      <div class="pdf-page image-page${p.fullBleed ? ' full-bleed' : ''}">
        <img class="full-image" src="${p.characterImage?.s3Url || ''}" alt="character" />
      </div>

      <div class="pdf-page text-page${p.fullBleed ? ' full-bleed' : ''}">
        <div class="bg" style="background-image: url('${p.backgroundImage?.s3Url || ''}');"></div>
        <div class="overlay-text">${p.html ? p.html : `<p>${escapeHtml(p.text || '')}</p>`}</div>
      </div>
    `).join('')}

    ${story.backCoverImage?.s3Url ? `
      <div class="pdf-page back-cover" style="background-image: url('${story.backCoverImage.s3Url}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        ${story.backCoverBlurb ? `<div class="back-text">${escapeHtml(story.backCoverBlurb)}</div>` : ''}
      </div>
    ` : ''}

    <script>
      // Minimal synchronous wait to ensure fonts and images have at least started loading.
      try { if (document.fonts && document.fonts.ready) { /* fonts.load is synchronous here for PDF */ } } catch(e) {}
    </script>
  </body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
