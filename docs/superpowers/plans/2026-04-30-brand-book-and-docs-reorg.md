# Brand Book, Source Generators & Docs Reorganization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a source-generated brand book and deliverable infrastructure (following the anchor-angels pattern), and reorganize `docs/` into a hierarchical structure.

**Architecture:** `src/` holds generator scripts (Python for DOCX, HTML+Puppeteer for PDF brand book/deck). `docs/` is reorganized from flat files into numbered category directories. `output/` holds generated artifacts. Shared brand constants live in `src/utils/brand_constants.py` and mirror the storefront design tokens. npm scripts wire all builds.

**Tech Stack:** Python 3 (python-docx, openpyxl), Puppeteer (HTML→PDF), npm scripts, Google Fonts (Plus Jakarta Sans, JetBrains Mono)

---

## File Structure

```
src/
├── utils/
│   ├── brand_constants.py          # Colors, fonts, sizes — single source of truth
│   └── convert_pdf.py              # LibreOffice DOCX→PDF helper
├── internal/
│   └── brand/
│       ├── CaliLean_Brand_Book.html # Full brand book (1920×1080 slides)
│       └── export_brand_book_pdf.js # Puppeteer HTML→PDF export
├── external/
│   └── deck/
│       ├── CaliLean_Pitch_Deck.html # Investor/partner deck (1920×1080)
│       └── export_pdf.js            # Puppeteer export
└── README.md                        # Conventions: scripts only, no manual content

docs/                                # REORGANIZED
├── brand/                           # Identity & voice (moved, not renamed)
│   ├── identity-brief.md
│   ├── storefront-copy.md
│   ├── launch-narrative.md
│   ├── product-architecture.md
│   ├── channel-strategy.md
│   ├── wordmark-brief.md
│   ├── logo/
│   └── imagery/
├── compliance/                      # Legal & regulatory
│   ├── cd-playbook.md
│   ├── counsel-questions.md
│   └── state-ruo-posture.md
├── ops/                             # Operational runbooks
│   ├── per-state-suppression.md
│   └── sku-system.md               # moved from docs/ root
├── technical/                       # NEW — repo health, audit
│   ├── audit-2026-04.md            # moved from docs/ root
│   └── sku-mapping-v1.csv          # moved from docs/ root
├── superpowers/                     # Sprint plans & specs (unchanged)
│   ├── plans/
│   └── specs/
└── README.md                        # NEW — docs index/table of contents

output/
├── internal/
│   └── brand/
│       └── CaliLean_Brand_Book.pdf  # Generated
└── external/
    └── deck/
        └── CaliLean_Pitch_Deck.pdf  # Generated
```

---

### Task 1: Shared brand constants (Python)

**Files:**
- Create: `src/utils/__init__.py`
- Create: `src/utils/brand_constants.py`
- Create: `src/utils/convert_pdf.py`
- Create: `src/README.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/utils src/internal/brand src/external/deck output/internal/brand output/external/deck
```

- [ ] **Step 2: Create utils/__init__.py**

```python
# src/utils/__init__.py
```

(Empty file — package marker)

- [ ] **Step 3: Create brand_constants.py**

```python
# src/utils/brand_constants.py
"""
CaliLean brand constants — single source of truth.

Mirrors storefront tokens in apps/storefront/src/styles/calilean-tokens.css
and email brand config in packages/plugin-email/src/providers/email-notifications/lib/brand.ts

Change here → rebuild all documents → everything stays in sync.
"""

# ── Colors ────────────────────────────────────────────────────────────
BG       = "#FFFFFF"   # Page background, clean white
INK      = "#111111"   # Body text, wordmark, near-black
PACIFIC  = "#7090AB"   # Primary accent, Carolina Blue, CTAs, links
FOG      = "#9CA3A8"   # Muted text, dividers
SAND     = "#F0F0F0"   # Surface variant, cards, light grey
COA      = "#111111"   # Lab black — COA/batch/data UI
ALERT    = "#A23B2A"   # RUO disclaimer accent

# ── Typography ────────────────────────────────────────────────────────
DISPLAY_FONT = "Plus Jakarta Sans"
BODY_FONT    = "Plus Jakarta Sans"
MONO_FONT    = "JetBrains Mono"

# CSS font stacks (email/HTML safe)
DISPLAY_STACK = f"'{DISPLAY_FONT}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
MONO_STACK    = f"'{MONO_FONT}', 'SF Mono', 'Fira Code', Consolas, monospace"

# Google Fonts import URL
GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"

# ── Sizes (pt for DOCX, px for HTML) ─────────────────────────────────
TITLE_SIZE   = 36   # px
H1_SIZE      = 28   # px
H2_SIZE      = 20   # px
H3_SIZE      = 16   # px
BODY_SIZE    = 15   # px
SMALL_SIZE   = 13   # px
CAPTION_SIZE = 11   # px

# ── Brand identity ───────────────────────────────────────────────────
BRAND_NAME       = "Cali Lean"
BRAND_LEGAL      = "CaliLean"
DOMAIN           = "calilean.com"
URL              = "https://calilean.com"
SUPPORT_EMAIL    = "research@calilean.com"
TAGLINE          = "Peptides, on the record."
TAGLINE_ALT      = "Sequenced for results"
SECONDARY_TAG    = "Research-grade. South Bay-built."
SIGNOFF          = "— The Cali Lean team"
RUO_DISCLAIMER   = "For research use only. Not for human consumption."
LOCATION         = "El Segundo, CA"

# ── Assets ───────────────────────────────────────────────────────────
LOGO_BLACK_URL  = "https://bucket-production-4a36.up.railway.app/medusa-media/brand/calilean-logo-email.png"
LOGO_LOCAL_PATH = "docs/brand/logo/master/calilean-logo-black.png"
```

- [ ] **Step 4: Create convert_pdf.py**

```python
# src/utils/convert_pdf.py
"""DOCX → PDF conversion via LibreOffice headless."""

import os
import subprocess
import shutil
import tempfile


def find_libreoffice():
    """Find LibreOffice binary on macOS or Linux."""
    candidates = [
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        "/usr/bin/soffice",
        "/usr/bin/libreoffice",
        shutil.which("soffice"),
        shutil.which("libreoffice"),
    ]
    for c in candidates:
        if c and os.path.isfile(c):
            return c
    return None


def convert_docx_to_pdf(docx_path: str, pdf_path: str) -> bool:
    """Convert a DOCX file to PDF using LibreOffice headless."""
    soffice = find_libreoffice()
    if not soffice:
        print("LibreOffice not found — skipping PDF conversion")
        return False

    with tempfile.TemporaryDirectory() as tmpdir:
        result = subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf", "--outdir", tmpdir, docx_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode != 0:
            print(f"LibreOffice error: {result.stderr}")
            return False

        basename = os.path.splitext(os.path.basename(docx_path))[0] + ".pdf"
        tmp_pdf = os.path.join(tmpdir, basename)

        if os.path.exists(tmp_pdf):
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            shutil.move(tmp_pdf, pdf_path)
            return True

    return False
```

- [ ] **Step 5: Create src/README.md**

```markdown
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
```

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add src/ generator infrastructure with brand constants and PDF conversion"
```

---

### Task 2: HTML Brand Book

**Files:**
- Create: `src/internal/brand/CaliLean_Brand_Book.html`

This is the main deliverable — a full brand book as styled HTML slides (1920×1080), exported to PDF via Puppeteer. It pulls all content from the locked identity-brief.md.

- [ ] **Step 1: Create the brand book HTML**

Create `src/internal/brand/CaliLean_Brand_Book.html` — a complete, self-contained HTML file with embedded CSS. The document contains these slides:

1. **Cover** — Logo, tagline, location
2. **Positioning** — One-sentence positioning, one-paragraph context, audience
3. **Voice Pillars** — 4 pillars table (Coastal minimalism, Research-grade transparency, Accessible expertise, Local first)
4. **Voice Rules** — Do/don't pairs, voice rules of thumb
5. **Color Palette** — All 7 tokens with swatches, hex codes, usage notes
6. **Typography** — Plus Jakarta Sans specimen (display/body weights), JetBrains Mono specimen
7. **Logo Usage** — Wordmark, clear space, do/don't
8. **Button & UI** — CTA styles, surface ladder, component patterns
9. **Photography** — Mood direction, do/don't examples
10. **Application** — Email, storefront, packaging mockups
11. **RUO Compliance** — Disclaimer language, attestation patterns
12. **Closing** — Tagline, contact

The HTML must:
- Be self-contained (inline CSS, Google Fonts via @import)
- Use `page-break-after: always` between slides
- Viewport: 1920×1080
- All text uses Plus Jakarta Sans / JetBrains Mono
- Color swatches rendered as actual colored divs
- Logo loaded from the MinIO bucket URL

The full HTML content is approximately 800-1000 lines. The implementer should build it slide by slide, using the brand constants from `src/utils/brand_constants.py` as reference (but hardcoded in CSS since it's a standalone HTML file).

Key CSS structure:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: #111111; background: #FFFFFF; }

.slide {
  width: 1920px;
  height: 1080px;
  padding: 80px 120px;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}
```

Each slide should use:
- `.slide-header` — slide number + section title in FOG (#9CA3A8), 13px uppercase tracking
- Content fills the remaining space
- PACIFIC (#7090AB) for accents, links, section dividers
- Tables use SAND (#F0F0F0) for header rows
- Footer on each slide: "Cali Lean · Confidential" in FOG

- [ ] **Step 2: Verify renders locally**

```bash
open src/internal/brand/CaliLean_Brand_Book.html
```

Visually check: fonts load, colors match, slides are 1920×1080, page breaks work.

- [ ] **Step 3: Commit**

```bash
git add src/internal/brand/CaliLean_Brand_Book.html
git commit -m "feat: add HTML brand book with 12 slides covering full brand identity"
```

---

### Task 3: Brand Book PDF Export Script

**Files:**
- Create: `src/internal/brand/export_brand_book_pdf.js`

- [ ] **Step 1: Create the Puppeteer export script**

```javascript
// src/internal/brand/export_brand_book_pdf.js
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function exportBrandBook() {
  const htmlPath = path.resolve(__dirname, "CaliLean_Brand_Book.html");
  const outputDir = path.resolve(__dirname, "..", "..", "..", "output", "internal", "brand");
  const outputPath = path.join(outputDir, "CaliLean_Brand_Book.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error(`Brand book HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: "1920px",
    height: "1080px",
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`Brand book exported: ${outputPath}`);
}

exportBrandBook().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Install Puppeteer as a dev dependency**

```bash
pnpm add -D puppeteer -w
```

- [ ] **Step 3: Add npm scripts to root package.json**

Add to the `"scripts"` section:

```json
"build:brand-book": "node src/internal/brand/export_brand_book_pdf.js",
"build:deck": "node src/external/deck/export_pdf.js",
"build:all-docs": "npm run build:brand-book && npm run build:deck"
```

- [ ] **Step 4: Test the export**

```bash
npm run build:brand-book
```

Expected: `Brand book exported: output/internal/brand/CaliLean_Brand_Book.pdf`

- [ ] **Step 5: Commit**

```bash
git add src/internal/brand/export_brand_book_pdf.js package.json pnpm-lock.yaml
git commit -m "feat: add Puppeteer brand book PDF export script and npm build commands"
```

---

### Task 4: Pitch Deck HTML + Export

**Files:**
- Create: `src/external/deck/CaliLean_Pitch_Deck.html`
- Create: `src/external/deck/export_pdf.js`

- [ ] **Step 1: Create the pitch deck HTML**

Create `src/external/deck/CaliLean_Pitch_Deck.html` — 8-10 slides at 1920×1080. Same CSS patterns as the brand book. Content from product-architecture.md and launch-narrative.md:

1. **Cover** — Logo, tagline, "Investor Overview"
2. **Problem** — Gray-market peptide landscape, no transparency
3. **Solution** — Research-grade, every batch tested, COA published
4. **Product** — 8 launch SKUs, 3 categories, pricing
5. **Market** — South Bay athlete demographic, TAM/SAM/SOM
6. **Business Model** — DTC, subscription, unit economics
7. **Go-to-Market** — 90-day launch arc, founding-100, local-first
8. **Team** — Founders
9. **Traction / Ask** — Milestones, funding ask

Same CSS structure as brand book. Slides use a vertical PACIFIC (#7090AB) accent stripe on the left edge.

- [ ] **Step 2: Create the export script**

```javascript
// src/external/deck/export_pdf.js
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function exportDeck() {
  const htmlPath = path.resolve(__dirname, "CaliLean_Pitch_Deck.html");
  const outputDir = path.resolve(__dirname, "..", "..", "..", "output", "external", "deck");
  const outputPath = path.join(outputDir, "CaliLean_Pitch_Deck.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error(`Deck HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: "1920px",
    height: "1080px",
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`Pitch deck exported: ${outputPath}`);
}

exportDeck().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
```

- [ ] **Step 3: Commit**

```bash
git add src/external/deck/
git commit -m "feat: add pitch deck HTML and Puppeteer PDF export"
```

---

### Task 5: Reorganize docs/ hierarchy

**Files:**
- Move: various files within `docs/`
- Create: `docs/README.md`
- Create: `docs/technical/` directory

- [ ] **Step 1: Create new directories**

```bash
mkdir -p docs/technical
```

- [ ] **Step 2: Move files to their new locations**

```bash
# Move root-level docs into categorized directories
mv docs/audit-2026-04.md docs/technical/
mv docs/sku-system.md docs/ops/
mv docs/sku-mapping-v1.csv docs/technical/
mv docs/sku-mapping-v1.xlsx docs/technical/
```

- [ ] **Step 3: Create docs/README.md (index)**

```markdown
# CaliLean Documentation

## Brand
- [Identity Brief](brand/identity-brief.md) — Positioning, voice, visual direction (v1.4, locked)
- [Storefront Copy](brand/storefront-copy.md) — Paste-ready copy for all surfaces (v1.2)
- [Launch Narrative](brand/launch-narrative.md) — 90-day launch arc and campaign beats
- [Product Architecture](brand/product-architecture.md) — 33 SKUs, pricing, categories
- [Channel Strategy](brand/channel-strategy.md) — 30-day calendar, venues, email flows
- [Logo Assets](brand/logo/master/) — Wordmark PNG, favicon, black/white variants

## Compliance
- [C&D Playbook](compliance/cd-playbook.md) — Response decision tree, 4 buckets
- [Counsel Questions](compliance/counsel-questions.md) — 14 pre-built lawyer questions
- [State RUO Posture](compliance/state-ruo-posture.md) — 10-state legal matrix

## Operations
- [Per-State Suppression](ops/per-state-suppression.md) — Hot-fix geo-blocking runbook
- [SKU System](ops/sku-system.md) — Compound codes, SKU format

## Technical
- [Repo Audit](technical/audit-2026-04.md) — April 2026 stack snapshot
- [SKU Mapping](technical/sku-mapping-v1.csv) — Product-to-SKU table

## Generated Deliverables
Build from `src/`:
- Brand Book: `npm run build:brand-book` → `output/internal/brand/CaliLean_Brand_Book.pdf`
- Pitch Deck: `npm run build:deck` → `output/external/deck/CaliLean_Pitch_Deck.pdf`
```

- [ ] **Step 4: Update .gitignore for output/**

Add to `.gitignore`:
```
output/
```

- [ ] **Step 5: Commit**

```bash
git add docs/ .gitignore
git commit -m "refactor: reorganize docs/ into hierarchical structure with index"
```

---

### Task 6: Wire everything and push

- [ ] **Step 1: Build brand book**

```bash
npm run build:brand-book
```

Verify PDF exists at `output/internal/brand/CaliLean_Brand_Book.pdf`

- [ ] **Step 2: Build pitch deck**

```bash
npm run build:deck
```

Verify PDF exists at `output/external/deck/CaliLean_Pitch_Deck.pdf`

- [ ] **Step 3: Push to GitHub**

```bash
git push origin master
```

---

## Summary of Changes

| Category | What's Created | Files |
|----------|---------------|-------|
| `src/utils/` | Brand constants, PDF conversion helper | 3 new |
| `src/internal/brand/` | Brand book HTML (12 slides) + PDF export | 2 new |
| `src/external/deck/` | Pitch deck HTML (9 slides) + PDF export | 2 new |
| `docs/` | Reorganized hierarchy, README index | 1 new, 4 moved |
| Root | npm build scripts, puppeteer dep, .gitignore | 2 modified |
