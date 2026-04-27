# Copy Refresh Design — Outcome-Aware Subtitle Layer

> Date: 2026-04-27
> Status: Approved
> Approach: B (outcome-aware) with Approach 1 (subtitle layer)
> Constraint: Molecule names stay as primary identifiers. Credibility is paramount.

## Goal

Add research-pathway context across the storefront so the target audience (South Bay, 30-55, $250k+ HHI, Huberman listener) can orient themselves without prior peptide knowledge — while keeping molecule names, COA language, and RUO compliance as the credibility foundation.

## Target Audience (from identity-brief v1.4)

Manhattan/Hermosa/Redondo/El Segundo/PV adult, 30-55, household income $250k+. Peloton in the garage, Whoop on the wrist, Huberman in the headphones. Already tried creatine, glutathione IVs, red-light. Wants the next thing without the gray-market risk.

## Scope

19 string changes across 5 change types. No structural changes. No new components except 3 missing surfaces.

---

## 1. Product Subtitles (8 Launch SKUs)

Set via Medusa Admin API `subtitle` field. Renders on product cards (store page, home featured) and PDP header. ≤6 words. Descriptive molecule classifications, not therapeutic claims.

| SKU Title (unchanged) | Subtitle |
|---|---|
| BPC-157 | Tissue repair pentadecapeptide |
| TB-500 | Thymosin β-4 repair fragment |
| BPC-157 / TB-500 Blend | Dual-peptide repair stack |
| CJC-1295 / Ipamorelin Blend | GHRH + GHSR secretagogue stack |
| Glutathione | Endogenous antioxidant tripeptide |
| NAD+ | Metabolic coenzyme · DNA repair |
| MOTS-C | Mitochondrial-derived longevity peptide |
| Retatrutide | GLP-1/GIP/GCGR triple agonist |

**Implementation:** Admin API PATCH to each product's `subtitle` field.

---

## 2. Store Page Category Descriptions (4 strings)

File: `storefront/src/modules/store/templates/categorized-products.tsx`

| Category | Current | Updated |
|---|---|---|
| Repair | Tissue-repair peptides studied in soft-tissue, tendon, and gut models. | Peptides studied in tendon, ligament, and gut-tissue repair models. |
| GH Axis | Growth-hormone secretagogue stacks targeting the GHRH/GHSR pathway. | Secretagogue compounds targeting the growth-hormone release axis. |
| Longevity | Compounds studied in cellular metabolism, DNA repair, and mitochondrial function. | Compounds studied in cellular metabolism, oxidative stress, and mitochondrial function. |
| Metabolic | Multi-receptor agonists studied in metabolic and body-composition research. | Multi-receptor agonists studied in metabolic pathway research. |

---

## 3. Fix Known Divergences (3 surfaces)

### 3a. Lab Banner
File: `storefront/src/modules/calilean/components/lab-banner/index.tsx`
- Current: `Every batch assayed. Every certificate published.`
- Fix to: `What's in the vial. Printed on the label.`
- Reason: Spec alignment (launch-narrative §2.3, Beat 1 headline).

### 3b. FAQ Heading
File: `storefront/src/modules/calilean/components/faq-accordion/index.tsx`
- Current: `You <em className="italic">ask</em>. We answer.`
- Fix to: `You ask. We answer.` (plain text, no `<em>`)
- Reason: identity-brief §3.3 forbids italicized verbs in headlines.

### 3c. Store Page Metadata
File: `storefront/src/app/[countryCode]/(main)/store/page.tsx`
- Current title: `Store`
- Current description: `Explore all of our products.`
- Fix title to: `The Lineup | CaliLean`
- Fix description to: `Eight research-grade compounds across repair, GH axis, longevity, and metabolic pathways. Every vial batch-tested.`

---

## 4. Missing Surfaces (3 additions)

### 4a. Cart Attestation Hint
Location: Above checkout CTA in cart summary.
File: `storefront/src/modules/cart/templates/summary.tsx`
Copy: `By checking out you confirm this purchase is for research use only.`

### 4b. Search Empty State
Location: Search results page when no results found.
File: Wherever the search empty state renders (likely `storefront/src/modules/search/` or inline).
Copy: `No results. Try a molecule name — BPC-157, NAD+, Retatrutide.`

### 4c. 500 Error Page
File: Create `storefront/src/app/error.tsx` or `storefront/src/app/[countryCode]/(main)/error.tsx`
- H1: `Something broke on our end.`
- Body: `Refresh, or try again in a minute. If it persists, email research@calilean.bio.`

---

## 5. Surfaces Unchanged

The following are compliant with the spec and remain untouched:

- Hero (H1, subhead, CTA)
- Announcement bar
- Value props (all 3)
- FAQ Q&As (all 8)
- Footer (brand description, nav, contact, copyright)
- Age gate (headline, body, CTAs)
- 404 page (H1, body, CTA)
- Login/register copy
- Order confirmation (H1, subhead)
- Privacy/terms page headers
- RUO constants in `lib/ruo.ts`
- Nav items

---

## Voice Rules Checklist (from identity-brief §3.3)

All proposed copy verified against:
- [x] No exclamation points
- [x] No em-dashes in marketing copy
- [x] No italicized verbs in headlines
- [x] Average sentence ≤14 words
- [x] Max one adjective per noun
- [x] Numbers as numerals (5mg, not "five milligrams")
- [x] First-person plural only when speaking as company
- [x] No therapeutic claims, dosing guidance, or medical advice

---

## Implementation Order

1. Product subtitles via Admin API (8 PATCH calls)
2. Category descriptions in `categorized-products.tsx` (4 string edits)
3. Lab banner fix (1 string edit)
4. FAQ heading fix (remove `<em>` tag)
5. Store page metadata (2 string edits)
6. Cart attestation hint (add `<p>` element)
7. 500 error page (new file)
8. Search empty state (string edit or new component)
