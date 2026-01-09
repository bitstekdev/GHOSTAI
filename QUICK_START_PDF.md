# 🚀 Quick Start: PDFKit PDF Generation

## ✅ What's Ready

Your StoryFlipbook PDF generation is **100% implemented** using PDFKit.

**Components:**
- ✅ Backend PDF route (`/api/pdf/generate-pdf`)
- ✅ PDF generation engine (PDFKit with PDFDocument)
- ✅ HTML parsing for styled text
- ✅ Text box positioning (exact flipbook layout match)
- ✅ Support for portrait/landscape/square books
- ✅ Frontend download handler (already in FlipBook.jsx)
- ✅ Auto-cleanup of temporary files

---

## 📥 ONE THING YOU MUST DO: Add Fonts

**Without fonts, PDF generation will fail.**

### Quick Setup (5 minutes)

1. **Go to Google Fonts:**
   ```
   https://fonts.google.com/specimen/Poppins
   ```

2. **Download the font pack** (click the download icon ↓)

3. **Extract and copy these files:**
   ```
   backend/src/pdf/fonts/
   ├── Poppins-Regular.ttf
   ├── Poppins-Medium.ttf
   ├── Poppins-SemiBold.ttf
   ├── Poppins-Bold.ttf
   └── Poppins-Italic.ttf
   ```

### Verify

```bash
ls backend/src/pdf/fonts/
# Should list all 5 TTF files
```

---

## 🧪 Test It

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Start backend

```bash
npm run dev
```

### 3. Trigger download from frontend

In your browser:
1. Open a story in FlipBook
2. Hover over the book (left toolbar appears)
3. Click **"Download PDF"** button

### 4. What happens

- Browser sends storyData to `/api/pdf/generate-pdf`
- Backend generates PDF in memory
- PDF downloads automatically
- Temp file is deleted

---

## 🎯 How It Works

```
Click "Download PDF"
    ↓
POST storyData to /api/pdf/generate-pdf
    ↓
Backend receives request
    ↓
PDFKit generates PDF:
  • Cover page (image)
  • Story pages (alternating image + text)
  • Back cover (image)
    ↓
Write PDF to temp file
    ↓
Stream file to browser
    ↓
Browser downloads PDF
    ↓
Temp file auto-deleted
```

---

## 📊 PDF Output

**One PDF page contains:**
- **Image pages** → Full-page character/background images
- **Text pages** → Text centered in flipbook-exact position
- **Cover** → Title overlaid on cover image
- **Back cover** → Optional back cover image + blurb

**Example for 3 story pages:**
```
Page 1: Cover
Page 2: Character image (page 1)
Page 3: Story text (page 1)
Page 4: Character image (page 2)
Page 5: Story text (page 2)
Page 6: Character image (page 3)
Page 7: Story text (page 3)
Page 8: Back cover
```

---

## ⚙️ Configuration

### Adjust text position

If text appears in wrong position in PDF:

Edit [backend/src/pdf/generateStorybookPdf.js](backend/src/pdf/generateStorybookPdf.js):

```javascript
const FLIPBOOK_LAYOUT = {
  portrait:   { x: 90,  y: 160, width: 588, height: 700 },
  landscape:  { x: 110, y: 140, width: 480, height: 480 },
  square:     { x: 120, y: 160, width: 520, height: 520 },
};
```

Values are in **points** (1/72 inch). Adjust until text matches flipbook position exactly.

### Change text colors/styles

In the same file, edit `STYLE_MAP`:

```javascript
const STYLE_MAP = {
  base: {
    font: 'Poppins-Regular',
    fontSize: 14,
    color: '#111827',  // ← Change text color
  },
  // ... more styles
};
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Font warnings in console** | Add all 5 Poppins fonts to `backend/src/pdf/fonts/` |
| **PDF downloads blank** | Check browser console for errors, check backend logs |
| **Text in wrong position** | Adjust FLIPBOOK_LAYOUT values (see above) |
| **Images not showing** | Verify S3 URLs in storyData are correct |
| **Slow PDF generation** | Normal for first request; PDFKit is fast after that |

---

## ✨ Key Files

| File | Purpose |
|------|---------|
| [backend/src/routes/pdf.js](../../backend/src/routes/pdf.js) | API endpoint handler |
| [backend/src/pdf/generateStorybookPdf.js](../../backend/src/pdf/generateStorybookPdf.js) | Core PDF generation logic |
| [backend/src/pdf/fonts/](../../backend/src/pdf/fonts/) | Local font directory (must add .ttf files) |
| [frontend/src/components/pages/FlipBook.jsx](../../frontend/src/components/pages/FlipBook.jsx#L44) | Download button handler |

---

## 🎓 Next: Advanced

Once fonts are added and working, you can:

- **Scale text on overflow** → Add auto-size logic
- **Add page numbers** → Modify HTML template
- **Print-ready version** → Add CMYK conversion
- **Lambda deployment** → Use puppeteer-core instead

---

## ✅ Status

**Ready to use** — Just add fonts and test!

---

**Need help?** Check [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) for full details.
