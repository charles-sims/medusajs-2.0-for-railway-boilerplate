# src/ — Source-Generated Deliverables

Scripts only. No hand-written content in this directory.

## Conventions

- All generators import from `src/utils/brand_constants.py` for colors, fonts, sizes
- HTML deliverables (brand book, deck) are 1920×1080 viewport, exported to PDF via Puppeteer
- DOCX deliverables use `python-docx`, converted to PDF via LibreOffice headless
- Output goes to `output/<category>/<type>/`

## Build Commands

```bash
npm run build:brand-book    # HTML → PDF brand book
npm run build:deck          # HTML → PDF pitch deck
npm run build:all-docs      # Build everything
```

## Structure

```
src/
├── utils/                  # Shared brand constants + helpers
├── internal/brand/         # Brand book (HTML → PDF)
├── external/deck/          # Pitch deck (HTML → PDF)
output/
├── internal/brand/         # Generated brand book PDF
└── external/deck/          # Generated pitch deck PDF
```
