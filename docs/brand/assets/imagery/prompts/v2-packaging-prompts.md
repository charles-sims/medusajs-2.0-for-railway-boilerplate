# CaliLean — Packaging Render Prompts v2

**Date:** 2026-04-30
**Purpose:** Generate manufacturing-ready packaging renders for all 15 launch products
**Provider:** Google Imagen 4 (natural-language format per v0.1 learnings)
**Status:** Replaces v0 prompts for label/box design only. PDP/editorial prompts in `image-gen-brief.md` remain valid for product photography.

---

## What Changed from v1

1. **Label redesigned** — premium typography hierarchy, compound name is hero, "RESEARCH GRADE" demoted
2. **`=` mark is now a colored category accent** — not Iron
3. **QR code added** — in category accent color
4. **RUO disclaimer on every label** — "For research use only. Not for human use."
5. **Cap color unique per product** — 15 unique caps
6. **3 warm cap colors cooled down** to work with steel-blue box (Amber→Antique Gold, Copper→Patina, Sand Gold→Pewter Gold)
7. **New render types** — flat label artwork, box dieline, component breakdown

---

## 1. Final Color System (Corrected)

### Category Colors (= mark + QR code)

| Category | Token | Hex | On Box? |
|----------|-------|-----|---------|
| Repair | Pacific | `#3A5A6A` | Yes — cool, native to box |
| Metabolic | Ember | `#9E5A2A` | Yes — pulled cooler/darker from `#B8622E` |
| GH Axis | Slate | `#5B6E8A` | Yes — cool blue family |
| Longevity | Eucalyptus | `#7C8A78` | Yes — cool sage, existing brand |
| Specialty | Driftwood | `#7A6655` | Yes — pulled cooler from `#8A6E5B` |
| Accessory | Fog | `#8B9298` | Yes — neutral |

### Product Cap Colors (corrected for box harmony)

| # | Product | Cap Name | Cap Hex | Changed? |
|---|---------|----------|---------|----------|
| 1 | BPC-157 | Pacific Blue | `#3A5A6A` | No |
| 2 | TB-500 | Deep Teal | `#2A6B6B` | No |
| 3 | GHK-Cu | Patina | `#6B7E6B` | Yes — was Copper `#8B5E3C`, now muted green-gray. Still nods to copper patina. |
| 4 | Wolverine | Charcoal | `#3D3D3D` | No |
| 5 | CL-1S | Antique Gold | `#8A7D5A` | Yes — was Amber `#C4842D`, now desaturated olive-gold. Cool enough for box. |
| 6 | CL-2T | Burnt Sienna | `#7A4A35` | Slightly darkened from `#A0522D` |
| 7 | CL-3R | Rust | `#6B3A2E` | Slightly darkened from `#8B3A2E` |
| 8 | Ipamorelin | Steel Blue | `#4682B4` | No |
| 9 | Tesamorelin | Navy | `#2C3E50` | No |
| 10 | MOTS-c | Sage | `#7C8A78` | No |
| 11 | SS-31 | Forest | `#4A6350` | No |
| 12 | GLOW | Pewter Gold | `#9A9478` | Yes — was Sand Gold `#C2A878`, now muted pewter. |
| 13 | KLOW | Clay | `#7A6B5E` | Slightly adjusted from `#8E7360` |
| 14 | Melanotan 2 | Bronze | `#5E4538` | Slightly darkened from `#6B4E3D` |
| 15 | Bac Water | Light Gray | `#B0B8BF` | No |

All 15 caps now sit comfortably against the matte steel-blue box (`~#6B8399`). No warm tones fight the cool packaging.

---

## 2. Label Layout — Flat Horizontal (for printing)

Standard 2mL vial wraparound label. Dimensions: approximately 58mm wide x 25mm tall (wraps ~75% of vial circumference).

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  CaliLean                            ══                      │
│  ─────────────────────────────────   (= mark in              │
│                                       category color)        │
│                                                              │
│  BPC-157                             [QR CODE]               │
│  10mg                                (QR in category         │
│                                       color)                 │
│  ─────────────────────────────────────────────────           │
│                                                              │
│  Lot CL-BPC-0410-A · >99% · 2-8°C   For research use only.  │
│                                      Not for human use.      │
│  calilean.com/coa                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
 ◄─────── LEFT ZONE (brand + product) ────►◄── RIGHT ZONE ──►
```

### Typography on Label

| Element | Font | Weight | Size (relative) | Color |
|---------|------|--------|-----------------|-------|
| "CaliLean" wordmark | Plus Jakarta Sans | 700 | Small (8pt) | Iron `#1F2326` |
| `══` mark | — | — | Medium (12pt) | **Category accent color** |
| Compound name | Plus Jakarta Sans | 700 | **Large (14pt hero)** | Iron `#1F2326` |
| Dosage | JetBrains Mono | 400 | Medium (10pt) | Fog `#8B9298` |
| Lot · Purity · Temp | JetBrains Mono | 400 | Small (6pt) | Fog `#8B9298` |
| RUO disclaimer | Plus Jakarta Sans | 500 | Small (6pt) | Iron `#1F2326` |
| URL | JetBrains Mono | 400 | Tiny (5pt) | Fog `#8B9298` |
| QR code | — | — | ~8mm square | **Category accent color** |

### Key Layout Rules

- **Two-column layout**: Left zone has brand + product info. Right zone has `=` mark and QR code stacked vertically.
- **Compound name is the hero** — largest text, immediately readable at arm's length.
- **RUO disclaimer is mandatory on label** — bottom-right, small but legible. Full text: "For research use only. Not for human use."
- **Hairline rule** separates the brand zone (top) from the data zone (bottom).
- **No "RESEARCH GRADE" text** — the box carries this. Label stays clean.

---

## 3. Box Layout — Dieline (for manufacturing)

Matte steel-blue rigid paperboard box. Approximate dimensions for a 2mL vial: 30mm x 30mm x 70mm (W x D x H).

### Box Faces

```
                    ┌─────────┐
                    │   TOP   │
                    │  30x30  │
                    │         │
                    │CaliLean │
                    │   ══    │ ← category color
                    │         │
        ┌───────────┼─────────┼───────────┬─────────┐
        │  SIDE B   │  FRONT  │  SIDE A   │  BACK   │
        │  30x70    │  30x70  │  30x70    │  30x70  │
        │           │         │           │         │
        │(rotated   │  [CL    │BPC-157    │[Barcode]│
        │ text:     │  mono-  │10mg       │         │
        │ compound  │  gram]  │           │Lot:     │
        │ + dosage  │         │Lyophilized│CL-BPC-  │
        │ + RUO     │         │Powder     │0410-A   │
        │ + storage)│         │>99% Pure  │         │
        │           │CaliLean │           │Research │
        │           │         │2-8°C      │Use Only.│
        │           │         │           │Not for  │
        │           │         │RUO        │human or │
        │           │         │           │animal   │
        │           │         │[QR]       │use.     │
        │           │         │           │         │
        │           │         │calilean   │calilean │
        │           │         │.com       │.com/coa │
        └───────────┼─────────┼───────────┴─────────┘
                    │ BOTTOM  │
                    │  30x30  │
                    │         │
                    │[Barcode]│
                    │ UPC     │
                    └─────────┘
```

| Face | Content | Print Color |
|------|---------|-------------|
| **Front** | Large CL monogram (white, watermark opacity), "CaliLean" wordmark bottom | White on steel-blue |
| **Side A** (product side) | Compound name, dosage, form, purity, storage, RUO text, QR code, URL | White text on steel-blue. QR in category accent. |
| **Side B** (info side) | Compound + dosage + "Research Use Only - Not for human consumption" + "Keep refrigerated" (rotated 90°) | White on steel-blue |
| **Back** | Barcode/UPC, lot number, full legal disclaimer, URL | White on steel-blue |
| **Top** | "CaliLean" wordmark + `══` mark in category accent color | White + accent on steel-blue |
| **Bottom** | UPC barcode | White on steel-blue |

---

## 4. Render Types Needed Per Product

Each of the 15 products needs **5 renders**:

| # | Render Type | Aspect | Purpose |
|---|------------|--------|---------|
| A | **Vial front view** | 1:1 | Hero shot — vial with label facing camera, box behind. PDP primary. |
| B | **Vial back/side view** | 1:1 | Shows the wraparound label from the QR/RUO side. PDP gallery. |
| C | **Flat label artwork** | 3:1 | Label unrolled, flat, horizontal — for print production. Shows full bleed and typography. |
| D | **Box assembled** | 1:1 | Box standing, front and one side visible, no vial. Shows monogram + product side. |
| E | **Box dieline / exploded** | 16:9 | Box unfolded flat showing all 6 faces, or exploded view showing components (box + vial + cap + label separately). For manufacturer. |

**Total renders: 15 products x 5 views = 75 renders**

For Wolverine (2-vial stack): render A shows both vials + box.

---

## 5. Prompts

### Global System Block (paste into every prompt)

```
You are rendering packaging for CaliLean, a research-use-only peptide
brand based in coastal California. Aesthetic: Aesop apothecary meets a
pharmaceutical research bench. Restrained, ultra-premium, clinical.
Never wellness influencer, never bodybuilder, never stock-medical.
The brand uses a matte steel-blue box (approximately hex 6B8399) with
white printing. Vial labels are off-white stock (Salt hex F4F2EC) with
near-black Iron (hex 1F2326) typography. Each product has a unique
colored aluminum crimp cap and a colored accent mark on the label.
Typography: Plus Jakarta Sans for display and body. JetBrains Mono
for data (lot numbers, dosage, measurements). No serifs. No decorative
fonts. Light: cool diffuse daylight, 5400K, soft and even, no harsh
shadows, no flash. Style: premium pharmaceutical packaging photography,
sharp focus, label perfectly legible.
```

### Guard Rails (paste into every prompt)

```
DO NOT include: hands, people, lab coats, blue gloves, beakers, test
tubes, syringes, needles, gradient backdrops, marble, wood grain, sand,
gym equipment, bokeh on subject, motion blur, lens flare, HDR look,
instagram filter, neon, watermark, generated text beyond specified label
content, mockup annotations, decorative borders, leaves, droplets.
```

---

### Prompt A — Vial Front View (per product)

```
A premium product photograph of a single small clear glass research vial
(about two milliliters) standing upright, photographed at a slight
three-quarter angle (about 15 degrees from straight-on) so the front
label is fully visible. Behind and slightly to the right of the vial
stands a matte steel-blue rectangular box (approximately hex [BOX_HEX])
with a large semi-transparent white "CL" monogram on the front face
and "CaliLean" in small white sans-serif at the bottom of the box.

The vial has an aluminum crimp-seal cap colored [CAP_COLOR_NAME]
(hex [CAP_HEX]) with a silver aluminum crimp ring beneath it. Inside
the vial is a pale beige-white lyophilized powder cake.

The wraparound label on the vial is printed on off-white stock (hex
F4F2EC) with the following layout reading top to bottom:

Left side of label:
- "CaliLean" in small sans-serif (Plus Jakarta Sans style), near-black
- A thin hairline rule
- "[COMPOUND]" in large bold sans-serif, near-black — this is the
  largest text on the label, the hero element
- "[DOSAGE]" in medium monospace, muted gray (hex 8B9298)
- Another thin hairline rule
- "Lot [LOT] · >99% · 2-8°C" in tiny monospace, muted gray
- "calilean.com/coa" in tiny monospace, muted gray

Right side of label:
- A bold horizontal double-line mark (══) colored [ACCENT_COLOR_NAME]
  (hex [ACCENT_HEX])
- Below that, a small square QR code also in [ACCENT_COLOR_NAME]
  (hex [ACCENT_HEX])
- At the very bottom right in tiny text: "For research use only."
  and below that "Not for human use."

Background: clean white studio surface, very soft shadow beneath vial.
No other objects. Generous negative space. Sharp focus across vial and
box. Label must be perfectly legible.

[PASTE GUARD RAILS]
```

### Prompt B — Vial Back/Side View (per product)

```
A premium product photograph of the same CaliLean research vial as
Prompt A, but rotated approximately 180 degrees so the back/side of
the wraparound label is visible. The QR code (colored [ACCENT_HEX])
and the "For research use only. Not for human use." text should be
prominently visible in this view. The lot number line and
"calilean.com/coa" URL should also be readable. The [CAP_COLOR_NAME]
aluminum cap (hex [CAP_HEX]) is visible at the top. The steel-blue
box is visible in the background, slightly out of focus, showing the
product side panel with compound name and dosage in white text.

Same lighting, same background, same style as Prompt A. Label text
must be legible. Sharp focus on the vial.

[PASTE GUARD RAILS]
```

### Prompt C — Flat Label Artwork (per product)

```
A perfectly flat, horizontal, top-down photograph of a printed product
label laid flat on a clean white surface. The label is rectangular,
approximately three times as wide as it is tall (a wraparound vial
label unrolled flat). The label stock is off-white (hex F4F2EC) with
a very subtle paper texture.

The label is divided into two zones:

LEFT ZONE (approximately 65% of width):
- Top-left: "CaliLean" in small bold sans-serif, near-black (hex 1F2326)
- Below: a thin hairline rule spanning the left zone
- Center-left, large: "[COMPOUND]" in bold sans-serif, near-black —
  this is the dominant text element on the entire label
- Below compound name: "[DOSAGE]" in monospace, muted gray (hex 8B9298)
- Below: another thin hairline rule
- Bottom-left: "Lot [LOT] · >99% · 2-8°C" in tiny monospace, muted gray
- Below: "calilean.com/coa" in tiny monospace, muted gray

RIGHT ZONE (approximately 35% of width):
- Top-right: a bold horizontal double-line mark (══) colored
  [ACCENT_COLOR_NAME] (hex [ACCENT_HEX]), centered in the right zone
- Center-right: a QR code square, also in [ACCENT_COLOR_NAME]
  (hex [ACCENT_HEX]), approximately 8mm rendered size
- Bottom-right: "For research use only." in tiny sans-serif, near-black,
  and below that "Not for human use." in the same tiny text

The entire label has clean edges, no bleed marks visible, no crop marks.
It looks like a final proof ready for print production. Perfectly sharp,
perfectly flat, no perspective distortion, no shadow, no curl. Overhead
camera, 90 degrees straight down. White background around the label.

[PASTE GUARD RAILS]
```

### Prompt D — Box Assembled (per product)

```
A premium product photograph of a matte steel-blue rectangular box
(approximately hex [BOX_HEX]) standing upright, photographed at a
three-quarter angle so both the front face and one side panel are
visible. No vial in this shot — box only.

FRONT FACE: A large semi-transparent white "CL" monogram occupies the
upper two-thirds of the face. "CaliLean" is printed in small white
sans-serif text near the bottom.

VISIBLE SIDE PANEL (product info side): White text reading from top
to bottom:
- "[COMPOUND]" in bold sans-serif
- "[DOSAGE]" in monospace
- "Lyophilized Powder" in small sans-serif
- ">99% Pure" in small monospace
- "2-8°C" in small monospace
- A small QR code in [ACCENT_COLOR_NAME] (hex [ACCENT_HEX])
- "For research use only. Not for human or animal use." in tiny text
- "calilean.com" in tiny monospace

TOP FACE (partially visible at angle): "CaliLean" wordmark and a
small ══ mark in [ACCENT_COLOR_NAME] (hex [ACCENT_HEX]).

Background: clean white surface, very soft shadow. No other objects.
Premium pharmaceutical packaging photography. Sharp focus.

[PASTE GUARD RAILS]
```

### Prompt E — Box Dieline / Exploded Components (per product)

```
A clean top-down technical photograph showing the complete packaging
components for a CaliLean research product, laid out flat on a clean
white surface in an organized grid arrangement. This is a manufacturing
reference image showing every component separated.

Components laid out left to right:

1. BOX DIELINE (unfolded flat): The matte steel-blue box (hex [BOX_HEX])
   completely unfolded showing all six faces in a cross-shaped dieline
   pattern. White printing visible on each face:
   - Front: large CL monogram + "CaliLean" wordmark
   - Back: lot number field, barcode placeholder, legal text
   - Side A: "[COMPOUND]", "[DOSAGE]", specs, QR code in
     [ACCENT_COLOR_NAME], RUO disclaimer
   - Side B: compound name and dosage (rotated), RUO text
   - Top: "CaliLean" + ══ mark in [ACCENT_COLOR_NAME]
   - Bottom: UPC barcode area

2. FLAT LABEL: The wraparound vial label laid flat, showing the
   complete label artwork as described in Prompt C.

3. VIAL (empty): A clear 2mL glass vial, empty, no cap, no label.

4. CAP + CRIMP: An aluminum crimp cap in [CAP_COLOR_NAME]
   (hex [CAP_HEX]) with a silver aluminum crimp ring, shown
   from above.

All components arranged in a neat horizontal row with equal spacing.
Overhead camera, 90 degrees straight down. Clean white background.
No shadows except very subtle contact shadows. Sharp focus on all
components. Technical/manufacturing reference style — precise, clean,
no artistic flourish.

[PASTE GUARD RAILS]
```

---

## 6. Product Parameter Table

Copy-paste these values into the prompt placeholders:

| # | COMPOUND | DOSAGE | LOT | ACCENT_COLOR_NAME | ACCENT_HEX | CAP_COLOR_NAME | CAP_HEX | BOX_HEX |
|---|----------|--------|-----|-------------------|------------|----------------|---------|---------|
| 1 | BPC-157 | 10mg | CL-BPC-0410-A | Pacific | 3A5A6A | Pacific Blue | 3A5A6A | 6B8399 |
| 2 | TB-500 | 10mg | CL-TB5-0410-A | Pacific | 3A5A6A | Deep Teal | 2A6B6B | 6B8399 |
| 3 | GHK-Cu | 50mg | CL-GHK-0410-A | Pacific | 3A5A6A | Patina | 6B7E6B | 6B8399 |
| 4 | Wolverine | 10mg | CL-WLV-0410-A | Pacific | 3A5A6A | Charcoal | 3D3D3D | 6B8399 |
| 5 | CL-1S | 10mg | CL-GL1-0410-A | Ember | 9E5A2A | Antique Gold | 8A7D5A | 6B8399 |
| 6 | CL-2T | 10mg | CL-GL2-0410-A | Ember | 9E5A2A | Burnt Sienna | 7A4A35 | 6B8399 |
| 7 | CL-3R | 10mg | CL-GL3-0410-A | Ember | 9E5A2A | Rust | 6B3A2E | 6B8399 |
| 8 | Ipamorelin | 5mg | CL-IPM-0410-A | Slate | 5B6E8A | Steel Blue | 4682B4 | 6B8399 |
| 9 | Tesamorelin | 10mg | CL-TES-0410-A | Slate | 5B6E8A | Navy | 2C3E50 | 6B8399 |
| 10 | MOTS-c | 10mg | CL-MOT-0410-A | Eucalyptus | 7C8A78 | Sage | 7C8A78 | 6B8399 |
| 11 | SS-31 | 10mg | CL-SS3-0410-A | Eucalyptus | 7C8A78 | Forest | 4A6350 | 6B8399 |
| 12 | GLOW | 70mg | CL-GLW-0410-A | Driftwood | 7A6655 | Pewter Gold | 9A9478 | 6B8399 |
| 13 | KLOW | 80mg | CL-KLW-0410-A | Driftwood | 7A6655 | Clay | 7A6B5E | 6B8399 |
| 14 | Melanotan 2 | 10mg | CL-MT2-0410-A | Driftwood | 7A6655 | Bronze | 5E4538 | 6B8399 |
| 15 | Bac Water | 10mL | CL-BAC-0410-A | Fog | 8B9298 | Light Gray | B0B8BF | 6B8399 |

### Special Case: Wolverine (2-vial stack)

For Prompt A, modify to show two vials side by side:
- Vial 1: label reads "BPC-157 / 5mg" with Charcoal cap
- Vial 2: label reads "TB-500 / 5mg" with Charcoal cap
- Both vials share Pacific `=` mark and QR
- Single box behind both

### Special Case: Bac Water

- Vial contains clear liquid (not lyophilized powder)
- Label says "10mL" not "mg"
- No "Lyophilized Powder" on box — say "Sterile Water Solution" instead

---

## 7. Render Priority

### Phase 1 — Hero Products (generate first, validate system)
1. BPC-157 (all 5 views) — most recognizable peptide, test the template
2. CL-3R (all 5 views) — tests the Metabolic accent + Rust cap + coded naming
3. GLOW (all 5 views) — tests the Specialty accent + Pewter Gold cap

### Phase 2 — Full Lineup (remaining 12 products)
Generate Prompt A (vial front) for all 12 remaining products. Review caps against box. Then batch the remaining views.

### Phase 3 — Manufacturing Handoff
Prompt C (flat labels) and Prompt E (dieline/exploded) for all 15 — these go to the manufacturer.

---

## 8. QA Checklist Per Render

- [ ] Compound name is the largest text on the label
- [ ] "CaliLean" wordmark is small, top of label
- [ ] `══` mark is visible and in the correct category accent color
- [ ] QR code is visible and matches the `══` mark color
- [ ] "For research use only. Not for human use." is present on the label
- [ ] Lot number is present
- [ ] Cap color matches the product specification
- [ ] Cap crimp is silver (not colored)
- [ ] No generic drug names on GLP labels (no "Semaglutide", "Tirzepatide", "Retatrutide")
- [ ] Box is matte steel-blue with white CL monogram
- [ ] No hands, syringes, or other prohibited elements
- [ ] Label is legible at render resolution
