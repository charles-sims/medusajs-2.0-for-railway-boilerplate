# Label & Box Design Recommendations

**Date:** 2026-04-30
**Scope:** Review of CaliLean v1 draft renders + competitor best practices
**Files reviewed:** `docs/brand/assets/imagery/renders/v1-draft/` (8 renders)

---

## Current CaliLean Design Assessment

### What's Working Well

- **Brand identity is strong**: The muted steel-blue box with white CL monogram is distinctive, premium, and immediately recognizable. Competitors use generic white boxes or plain labels — CaliLean stands out.
- **Consistency**: All 8 renders share the same template — box color, label layout, typography, and vial style are uniform across the product line.
- **Clean aesthetic**: Minimalist design communicates research-grade seriousness without looking clinical or generic.
- **"Research Use Only" language**: Present on the box side panel. Good.
- **Vial label hierarchy**: Brand name at top, then "RESEARCH GRADE", then compound name and dosage. Clear reading order.

### Issues to Address

#### 1. CRITICAL: Generic Drug Names on GLP Labels
**File:** `retatrutide-30mg.jpeg`
- Vial reads "RESEARCH GRADE RETATRUTIDE (30MG)"
- Box reads "Retatrutide Research Grade Solution"
- **Fix:** Replace with `CL-3R (30MG)` and `CL-3R Research Grade Compound` (see legal analysis)
- Apply same fix to Semaglutide and Tirzepatide labels when produced

#### 2. Missing Required Label Elements

**Not visible on current labels:**
- Batch/Lot number — Every competitor includes this. Required for COA traceability.
- CAS number or molecular weight — Core Peptides and Flawless include this on labels.
- Storage instructions — Currently on box only ("Keep refrigerated"), should also be on vial label.
- QR code linking to COA — Mile High Compounds uses QR codes on every vial for instant batch verification. Strong trust signal.

**Recommended vial label template:**
```
┌─────────────────────────┐
│ CaliLean        [QR]    │
│                         │
│ RESEARCH GRADE          │
│ BPC-157 (10MG)          │
│                         │
│ Lot: CL-BPC-0410-A     │
│ Purity: >99%            │
│ Store: 2-8°C            │
│                         │
│ Research Use Only       │
│ Not for human use       │
│ calilean.com/coa        │
└─────────────────────────┘
```

#### 3. Box Side Panel Improvements

**Current box side panel contains:**
- Total mg
- Compound name + "Research Grade Solution"
- "Research Use Only - Not for human consumption"
- "Keep refrigerated"

**Missing (industry standard):**
- Lot/Batch number
- Purity percentage
- Form (Lyophilized powder)
- QR code to COA
- Full legal disclaimer
- Barcode/UPC for inventory management

**Recommended box side panel:**
```
┌──────────────────────────────┐
│ BPC-157                      │
│ Body Protection Compound     │
│ 10mg Total                   │
│                              │
│ Form: Lyophilized Powder     │
│ Purity: >99%                 │
│ Lot: CL-BPC-0410-A          │
│                              │
│ [QR Code]  [Barcode]         │
│                              │
│ Research Use Only             │
│ Not for human or animal use  │
│ Store at 2-8°C               │
│ calilean.com                 │
└──────────────────────────────┘
```

#### 4. Color-Coding by Category

**Competitor approach:** Mile High uses colored cap/crimp combinations to differentiate categories (Red/Silver, Orange/Silver, Green/Silver, Purple/Gold). Flawless does the same. This aids inventory management and visual identification.

**Recommendation for CaliLean:** Use colored cap crimps or a colored accent stripe on the box to differentiate categories:

| Category | Color Accent | Products |
|----------|-------------|----------|
| Repair | Green | BPC-157, TB-500, GHK-Cu, Wolverine |
| Metabolic | Orange | CL-1S, CL-2T, CL-3R |
| GH Axis | Blue | Ipamorelin, Tesamorelin |
| Longevity | Purple | MOTS-c, SS-31 |
| Specialty | Gold | GLOW, KLOW, Melanotan 2 |
| Accessory | Gray | Bac Water |

The main box color (steel blue) stays the same — just add a thin colored stripe or use a colored vial cap crimp. This preserves brand consistency while adding functional differentiation.

#### 5. Typography Observations

- **Vial label "CaliLean" text**: Appears in the brand's dark navy. Good.
- **"RESEARCH GRADE" text**: Bold, all-caps, slightly smaller than compound name. Good hierarchy.
- **Compound name**: Largest text element on label. Correct.
- **Box side text**: Very small, rotated 90 degrees, difficult to read in renders. Consider increasing font size or adjusting layout for legibility.

#### 6. Recovery Stack & GH Axis Stack Renders

- **recovery-stack-10mg.jpeg**: Shows 2 vials (BPC-157 10mg + TB-500 10mg) with a single box labeled "RECOVERY STACK". This is the Wolverine product. Good presentation — competitors sell this as "BPC/TB Blend" in a single vial, but CaliLean's 2-vial approach lets customers see both compounds.
- **gh-axis-stack-10mg.jpeg**: Shows CJC-1295 10mg + Ipamorelin 10mg. Note: CJC-1295 is not in the current launch SKU list. Consider whether this stack is launching or needs to be updated to match launch SKUs (which only include Ipamorelin as a standalone).

---

## Competitor Label/Box Best Practices Summary

### Mile High Compounds
- QR code on every vial linking to publicly viewable COAs
- Color-coded cap/crimp system per product grade
- "7x Tested" badge on marketing (not on label)
- Account-gated pricing with clean product pages
- Three product grades: Premium Lyophilized, Standard Lyophilized, Standard Non-Lyophilized

### Flawless Compounds
- Batch/Lot with received date, actual mg, purity %, endotoxin status on product page
- Color-coded caps (Red, Orange, White, Purple, Green)
- COA download button per batch
- "Buy More, Save More" displayed alongside product

### Ion Peptide
- Company-prefix naming (ION-1S, ION-2T, ION-3R)
- Volume discount table shown directly on product page
- "Institutional & Bulk Pricing" prominently featured
- USA Verified COAs badge

### Purgo Labs
- Mechanism-based descriptions instead of drug names
- "Acylated tri-pathway agonist peptide" for Retatrutide
- Clean, minimal label design

---

## Prioritized Action Items

### Immediate (Before Next Print Run)

1. **Remove all generic drug names** from GLP labels (retatrutide, semaglutide, tirzepatide)
2. **Add Lot/Batch number** field to vial label template
3. **Add "Not for human or animal use"** to vial labels (currently only on box)
4. **Add purity percentage** to both vial and box

### Short-Term (Next Design Iteration)

5. **Add QR code** to vial label linking to COA verification page (calilean.com/coa/{lot})
6. **Implement color-coded cap/crimp** system by product category
7. **Increase box side panel text size** for legibility
8. **Add UPC barcode** to box for retail/inventory compatibility
9. **Verify GH Axis Stack** render matches actual launch SKUs

### Medium-Term (Brand Evolution)

10. **Create COA verification web page** where customers scan QR and see batch-specific testing results
11. **Consider product grade tiers** (like Mile High's Premium/Standard) if sourcing supports it
12. **Design inner packaging insert** with full legal disclaimer, storage instructions, and reconstitution guidance
