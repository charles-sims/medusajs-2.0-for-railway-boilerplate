# CaliLean — Storefront Copy Doc (Bluum → CaliLean)

> Author: CMO · Version: v1 · Date: 2026-04-26
> Companion docs: `docs/brand/identity-brief.md` (v1.1, RUO), `docs/brand/launch-narrative.md` (v1), `docs/brand/product-architecture.md` (v1)
> Audience: CTO (executes the swap in [SKA-4](/SKA/issues/SKA-4)), future Copywriter (per-SKU long copy)
> Single deliverable for [SKA-11](/SKA/issues/SKA-11). Locked. Bring exceptions back to CMO.

---

## 0. How to use this doc

This is a **paste-ready string list**. Every section maps to a file/component the CTO touches in [SKA-4](/SKA/issues/SKA-4). The format per touchpoint is:

- **Where:** path + line range
- **Replace:** old Bluum string
- **With:** new CaliLean string
- **Note:** voice/RUO/legal flag if any

Voice rules ([identity brief §3.3](identity-brief.md)): no em-dashes in marketing copy, no exclamation points anywhere, average sentence length ≤ 14 words, body copy never over 25, zero-or-one adjective per noun. RUO constants live in `storefront/src/lib/ruo.ts` — **CTO updates that file with the values in §11 below**, then references the constants instead of duplicating strings.

Two surfaces are owned **upstream of this doc** and not redrawn here: (1) per-SKU long copy belongs to a future Copywriter — this doc ships **short product cards + short PDP descriptions** for the 7 launch SKUs; (2) the wordmark and visual system are in [SKA-13](/SKA/issues/SKA-13).

---

## 1. Site metadata + global

### 1.1 Root metadata

- **Where:** `storefront/src/app/layout.tsx:6-10`
- **Replace:**
  - `title: "Bluum Peptides | Research-Grade Peptides"`
  - `description: "USA-based supplier of high-purity peptides for advanced research and development."`
- **With:**
  - `title: "CaliLean | Peptides, plainly labeled."`
  - `description: "Research-grade peptides for the South Bay. Third-party assayed, batch-traceable, plainly labeled. Sold for research use only."`

### 1.2 Homepage metadata

- **Where:** `storefront/src/app/[countryCode]/(main)/page.tsx:10-13`
- **Replace:**
  - `title: "Bluum Peptides | Research-Grade Peptides, Delivered"`
  - `description: "USA-based supplier of high-purity peptides for advanced research and development. Buy online today."`
- **With:**
  - `title: "CaliLean | Research-grade peptides, plainly labeled."`
  - `description: "Third-party assayed, batch-traceable peptides built in the South Bay. Sold for research use only. COA published per batch."`

### 1.3 OG / social cards

The audit flagged no OG image route exists. Pending the visual system from [SKA-13](/SKA/issues/SKA-13), copy for the OG image and Twitter/X card:

- **OG title:** `Peptides, plainly labeled.`
- **OG subtitle:** `Research-grade. Built for the South Bay. COA published per batch.`
- **Twitter site handle:** placeholder `@calilean` (CMO confirms once the social handle is reserved; CTO leaves the field but commented out until the handle is locked)

### 1.4 Storefront-wide brand name swap

- **Replace everywhere in markup, alt text, and aria-labels:** `Bluum`, `Bluum Peptides`, `BluumLogo`
- **With:** `CaliLean`, `CaliLean`, `CaliLeanLogo`
  (Module rename `modules/bluum/` → `modules/calilean/` per audit §3.1 happens in the same PR.)

---

## 2. Announcement bar

- **Where:** `storefront/src/modules/bluum/components/announcement-bar/index.tsx:4`
- **Replace:** `Verified Purity & US Shipping`
- **With:** `Third-party assayed. Batch-traceable. Built in the South Bay.`
- **Note:** drop the `&` shipping claim — fast US shipping is true but it's a logistics promise, not the brand promise. Keep three short clauses, period-separated.

---

## 3. Hero (homepage)

- **Where:** `storefront/src/modules/home/components/hero/index.tsx:7-21`
- **Replace block:**
  - Pill: `Verified Purity & US Shipping`
  - H1: `Research-Grade Peptides, delivered`
  - Subhead: `Lab-tested before they hit your lab. Your research starts with ours.`
  - CTA: `Shop Peptides`
- **With block:**
  - Pill: `Read the label.`
  - H1: `Peptides, plainly labeled.`
  - Subhead: `Research-grade compounds for the South Bay athlete. Third-party assayed. Batch-traceable. Sold for research use only.`
  - CTA: `Shop the lineup`
- **Note:** the pill carries the master campaign tagline ([Beat 1, "Read the Label"](launch-narrative.md)). `Peptides, plainly labeled.` is the locked master tagline ([identity brief §4](identity-brief.md)). The subhead carries the geo + RUO posture in one paragraph.

---

## 4. Lab-tested banner

- **Where:** `storefront/src/modules/bluum/components/lab-banner/index.tsx:5-7`
- **Replace:** `Lab-tested before they hit your lab. Your research starts with ours.`
- **With:** `What's in the vial. Printed on the label.`
- **Note:** this banner is one of the most reused surfaces. The new line is the headline of [hero campaign Beat 1](launch-narrative.md). The italics emphasis on the existing template can move from `before` → `Printed`.

---

## 5. Value props (3-up)

- **Where:** `storefront/src/modules/bluum/components/value-props/index.tsx:1-30`
- **Replace block:**
  - 1: `Lab-Verified Purity` — Janoshik / BioRegen, full COAs.
  - 2: `Fast USA Shipping` — same-day from US facility.
  - 3: `Next-Generation Compounds` — established staples to latest innovations.
- **With block:**
  - 1 — Title: `Third-party assayed.` Body: `Every batch goes to an independent lab. We publish the certificate of analysis on the product page, not in a footer.`
  - 2 — Title: `Batch-traceable.` Body: `Your vial carries the lot number on the label. Match it to the COA before you open the box.`
  - 3 — Title: `Built in the South Bay.` Body: `Sourced, packaged, and shipped from El Segundo. Two-day standard to most US labs.`
- **Note:** drop named test labs from this surface. We name the testing partner inside the FAQ and on each COA, but on the homepage the claim is the practice, not the partner. Replaces the four-square Bluum trust grid; the icons in the existing component can stay.

---

## 6. Trust badges (PDP)

- **Where:** `storefront/src/modules/bluum/components/trust-badges/index.tsx:2-8`
- **Replace block:**
  - `Money Back Guarantee`
  - `Satisfaction Guarantee`
  - `Easy Returns`
  - `Secure Ordering`
  - `2-Day Shipping`
  - `Third Party Tested`
- **With block (six, in this order):**
  - `COA published`
  - `Lot-traceable`
  - `Lyophilized`
  - `2-day US shipping`
  - `Encrypted checkout`
  - `Returns within 30 days`
- **Note:** the new badges trade vague reassurance ("Satisfaction Guarantee") for category-specific facts. `Lyophilized` is the standard form factor for peptides ([brand brief glossary](identity-brief.md)) and signals that the buyer knows the form factor. `Returns within 30 days` is a real policy — confirm with CEO before publishing if the policy is shorter; otherwise locked.

---

## 7. Research disclaimer (PDP)

- **Where:** `storefront/src/modules/bluum/components/research-disclaimer/index.tsx:1-12`
- **Action:** **delete this component** and replace its usages with the shared `RUODisclaimer` from `storefront/src/modules/common/components/ruo-disclaimer/index.tsx` ([SKA-2](/SKA/issues/SKA-2)). Use `variant="long"` on PDP, `variant="short"` on cart, `variant="inline"` on transactional emails and the footer.
- **Replacement copy (lives in `storefront/src/lib/ruo.ts`):** see §11.

---

## 8. Age gate (now: research-access gate)

The existing component is a 21+ door. Per [identity brief §8](identity-brief.md), the language tilts away from "buy peptides" toward "access research compounds." [SKA-2](/SKA/issues/SKA-2) is replacing this with an attestation flow; the copy below is the **stopgap rewrite for the existing modal** and the **anchor copy for the SKA-2 attestation**.

### 8.1 Modal copy

- **Where:** `storefront/src/modules/bluum/components/age-gate/index.tsx:30-46`
- **Replace block:**
  - H: `You must be at least 21 to visit this site.`
  - Sub: `By entering this site, you are accepting our Terms of Service`
  - Buttons: `Decline` / `Accept`
- **With block:**
  - H: `Access research compounds.`
  - Sub: `CaliLean sells research-grade peptides for laboratory use only. You must be 21 or older. By entering, you accept our Terms.`
  - Buttons: `Leave` / `Enter`
- **Note:** `Leave` reads cleaner than `Decline` for the off-ramp. The destination on `Leave` should switch from the current `https://www.google.com` redirect (a Bluum quirk) to a soft exit at `https://www.usada.org/` or simply close the tab via `window.history.back()`. **CTO decides; CMO recommends `window.history.back()`.**

### 8.2 SKA-2 attestation flow (anchor copy)

The values below are what CTO sets in `storefront/src/lib/ruo.ts`. They override the placeholders [SKA-2](/SKA/issues/SKA-2) currently ships with.

- `RUO_AGE_GATE_HEADLINE` → `Access research compounds.`
- `RUO_AGE_GATE_BODY` → `CaliLean sells research-grade peptides for laboratory use only. You must be 21 or older to enter.`
- `RUO_ATTESTATION_LABEL` → `I confirm I am a qualified researcher purchasing for in-vitro research only. I will not consume these products or administer them to humans or animals.`
- `RUO_DISCLAIMER_SHORT` → `For research use only. Not for human consumption.`
- `RUO_DISCLAIMER_LONG` → see §11.
- `RUO_ATTESTATION_VERSION` → `1.1` (bumped from `1.0` because copy changed)

---

## 9. FAQ accordion

- **Where:** `storefront/src/modules/bluum/components/faq-accordion/index.tsx:5-37`
- **Action:** replace the entire `faqs` array. Heading on line 46-48 stays structurally; rewrite to: `You ask. We answer.` (period, not comma — kills the casual `you ask, we answer` cadence).

### 9.1 Replacement Q&A block (8 questions, in this order)

```ts
const faqs = [
  {
    q: "What does \"research-grade\" actually mean?",
    a: "Each batch ships with a third-party Certificate of Analysis confirming identity, mass, and purity by HPLC and mass spectrometry. The COA is on the product page and on the inner box flap. The batch number on your vial matches the report.",
  },
  {
    q: "Who runs your assays?",
    a: "Janoshik Analytical and BioRegen, both independent ISO-accredited labs. Each COA names the lab, the analyst, and the date.",
  },
  {
    q: "Where do you ship from? How long does it take?",
    a: "We ship from El Segundo, California. Standard delivery is 2 business days to most US addresses. Next-day delivery is available at checkout.",
  },
  {
    q: "How should peptides be stored?",
    a: "Lyophilized vials are stable at room temperature in transit. Once received, store unopened vials below 25°C. After reconstitution, refrigerate at 2-8°C and use per your protocol.",
  },
  {
    q: "Are these legal to purchase in the United States?",
    a: "Yes, when purchased and handled for in-vitro laboratory research only. Our products are sold strictly under research-use-only terms. They are not drugs, supplements, cosmetics, or food, and they are not for human or animal consumption.",
  },
  {
    q: "How do I pay?",
    a: "Major credit and debit cards at checkout. Encrypted end-to-end. We do not store card numbers.",
  },
  {
    q: "Do you offer bulk pricing for institutional researchers?",
    a: "Yes. Email research@calilean.bio with your institution and the SKUs you need. We respond within one business day.",
  },
  {
    q: "What is the shelf life of an unopened vial?",
    a: "Lyophilized peptides stored as directed are typically stable for 12 to 24 months, often longer below -20°C. Actual stability depends on sequence and storage conditions.",
  },
]
```

- **Note 1:** the support email switches from `hello@bluumpeptides.com` to `research@calilean.bio`. CMO recommends `research@` as the primary support address (signals the audience), with `hello@calilean.bio` aliased and forwarding. **CEO confirms domain availability and aliases**; if `calilean.bio` is locked-in (per memory, it is), use it; otherwise pivot to whatever domain is canonical.
- **Note 2:** the original FAQ said "we'll email you a secure payment link" — that suggests a manual checkout flow that we are not running. Removed.
- **Note 3:** the original FAQ named third-party labs in the answer about quality testing. Kept the labs in question 2 ("Who runs your assays?") because that is the right place for it; removed the brand-name dropping from the homepage value-props per §5.

---

## 10. Footer

### 10.1 Brand description

- **Where:** `storefront/src/modules/layout/templates/footer/index.tsx:17-19`
- **Replace:** `USA-based supplier of high-purity peptides for advanced research and development. All products are for laboratory research use only.`
- **With:** `Research-grade peptides, built in the South Bay. Third-party assayed and batch-traceable. Sold for research use only.`

### 10.2 Support column

- **Where:** `storefront/src/modules/layout/templates/footer/index.tsx:42-48`
- **Replace block:**
  - `hello@bluumpeptides.com`
  - `+1 512-903-2399`
  - `Mon-Fri 9AM-5PM CT`
- **With block:**
  - `research@calilean.bio`
  - `support@calilean.bio`
  - `Mon-Fri 9AM-5PM PT`
- **Note:** drop the phone number unless CEO explicitly wants a published line. A 512 area code on a South Bay brand reads wrong. If a phone number must publish, use a 310 area code or omit. **Decision: CEO.**

### 10.3 Disclaimer + copyright

- **Where:** `storefront/src/modules/layout/templates/footer/index.tsx:52-57`
- **Replace block:**
  - `DISCLAIMER: All products sold by Bluum are strictly intended for laboratory research use only. They are not approved for human or animal consumption, or for any form of therapeutic or diagnostic use.`
  - `© {year} Bluum Peptides. All rights reserved.`
- **With block:**
  - Use `<RUODisclaimer variant="long" />` from `@modules/common/components/ruo-disclaimer` instead of a hard-coded string. The constant copy lives in `storefront/src/lib/ruo.ts` (see §11).
  - `© {year} CaliLean. All rights reserved.`

### 10.4 "About Us" / "Contact" placeholder links

The current Company column links `About Us` and `Contact` to `/store`. Once the marketing pages exist, route them properly. **Tracked, not blocking [SKA-11](/SKA/issues/SKA-11).** CMO will write `About` and `Contact` page copy in a follow-up ticket.

---

## 11. RUO compliance constants (paste-ready)

Replace the placeholder values in `storefront/src/lib/ruo.ts` with these. Bump `RUO_ATTESTATION_VERSION` because copy changed.

```ts
export const RUO_DISCLAIMER_SHORT =
  "For research use only. Not for human consumption."

export const RUO_DISCLAIMER_LONG =
  "All CaliLean products are sold strictly for in-vitro research and laboratory use. They are not drugs, supplements, food, or cosmetics, and they are not intended to diagnose, treat, cure, or prevent any disease. Products are not for human or animal consumption. By purchasing, you confirm you are a qualified researcher and accept full responsibility for safe handling and lawful use under all applicable federal, state, and institutional regulations."

export const RUO_ATTESTATION_LABEL =
  "I confirm I am a qualified researcher purchasing for in-vitro research only. I will not consume these products or administer them to humans or animals."

export const RUO_ATTESTATION_VERSION = "1.1"

export const RUO_AGE_GATE_HEADLINE = "Access research compounds."

export const RUO_AGE_GATE_BODY =
  "CaliLean sells research-grade peptides for laboratory use only. You must be 21 or older to enter."
```

**Surface placement (CTO wires; CMO confirms):**
- PDP: `<RUODisclaimer variant="long" />` directly under the price.
- Cart line item: `<RUODisclaimer variant="inline" />` under each product row.
- Cart summary: `<RUODisclaimer variant="short" />` above checkout button.
- Checkout: attestation checkbox using `RUO_ATTESTATION_LABEL`. Order metadata records `ruo_attestation_version` and ISO timestamp.
- Footer (every page): `<RUODisclaimer variant="long" />` above the copyright.
- Transactional emails: `RUO_DISCLAIMER_SHORT` in the footer of every transactional email (welcome, order, shipping).

---

## 12. Store template (PLP)

- **Where:** `storefront/src/modules/store/templates/index.tsx:23-26`
- **Replace block:**
  - H1: `Shop All Peptides`
  - Sub: `Research-grade peptides, third-party tested, shipped from the USA.`
- **With block:**
  - H1: `The lineup.`
  - Sub: `Seven launch SKUs across Repair, GH Axis, and Longevity. Catalog SKUs below. Each ships with a published COA.`
- **Note:** category navigation order from [product architecture §6](product-architecture.md): Repair → GH Axis → Longevity → Adjacent → Education → COA library.

### 12.1 Empty / loading

- **Empty state copy:** `Nothing here yet.` (one sentence, period, no apology).
- **Loading skeleton aria-label:** `Loading the lineup`

---

## 13. Per-SKU copy (7 launch SKUs)

Short product card + short PDP description for each. Long-form per-SKU copy is a future Copywriter deliverable; this gives [SKA-4](/SKA/issues/SKA-4) enough to ship the rebrand without leaving placeholder Bluum strings on the catalog.

Format per SKU:
- **Card title:** displayed on storefront tiles and PLP. Title-cased exactly.
- **Card subtitle:** dose / form. One line.
- **Card meta:** the one descriptor that lives next to price. ≤ 8 words.
- **PDP one-liner:** displays under the H1 on the PDP. ≤ 25 words. RUO context only.
- **PDP description (short):** 2-3 sentences, citation-anchored. Inserted into Medusa's `description` field. **No therapeutic claims.**

Pricing, variants, category mapping: see [product architecture §2 + §5.2](product-architecture.md). CTO does not invent prices from this doc.

---

### 13.1 BPC-157 ★ (Repair)

- **Card title:** `BPC-157`
- **Card subtitle:** `5mg lyophilized · 10mg · 20mg`
- **Card meta:** `Repair · COA published`
- **PDP one-liner:** `A 15-amino-acid pentadecapeptide. Studied in rodent models of soft-tissue and gut tissue repair. Sold for research use.`
- **PDP description:**
  > A pentadecapeptide derived from a gastric protective compound, BPC-157 has been characterized across rodent studies of tendon, ligament, and gastrointestinal tissue repair. We publish the COA per batch with HPLC purity, mass confirmation, and lot date. Lot number prints on the vial.

### 13.2 TB-500 (Thymosin β-4 fragment) (Repair)

- **Card title:** `TB-500`
- **Card subtitle:** `Thymosin β-4 fragment · 5mg · 10mg`
- **Card meta:** `Repair · COA published`
- **PDP one-liner:** `A synthetic fragment of thymosin β-4, studied for cell migration and ECM remodeling. Sold for research use.`
- **PDP description:**
  > TB-500 is a synthetic fragment of the actin-sequestering protein thymosin β-4, characterized in published research on cell migration, angiogenesis, and extracellular matrix dynamics. Frequently paired with BPC-157 in soft-tissue repair models. Each batch ships with a third-party Certificate of Analysis.

### 13.3 GH Axis Stack — CJC-1295 + Ipamorelin ★ (GH Axis)

- **Card title:** `GH Axis Stack`
- **Card subtitle:** `CJC-1295 5mg + Ipamorelin 5mg · lyophilized`
- **Card meta:** `GH Axis · stack · COA published`
- **PDP one-liner:** `A research-use blend of a GHRH analog and a selective GHSR-1a agonist. Used in studies of pulsatile GH release.`
- **PDP description:**
  > A two-component research blend pairing CJC-1295 (No DAC), a GHRH analog, with Ipamorelin, a selective GHSR-1a agonist. The combination has been used in published research on growth hormone pulsatility and GH-axis dynamics. Each component is identity- and purity-confirmed by an independent lab; the COA covers both.

### 13.4 Retatrutide (GH Axis / Adjacent metabolic)

- **Card title:** `Retatrutide`
- **Card subtitle:** `15mg · 30mg · lyophilized`
- **Card meta:** `Metabolic · COA published`
- **PDP one-liner:** `A triple agonist of GLP-1R, GIPR, and GCGR. Studied in metabolic-pathway and energy-expenditure research.`
- **PDP description:**
  > Retatrutide is a triple-receptor agonist (GLP-1R / GIPR / GCGR), widely characterized in current literature on metabolic-pathway research and energy expenditure. We publish the COA per batch and recommend reviewing the analytical report before reconstitution.

### 13.5 NAD+ ★ (Longevity)

- **Card title:** `NAD+`
- **Card subtitle:** `500mg · lyophilized`
- **Card meta:** `Longevity · COA published`
- **PDP one-liner:** `Nicotinamide adenine dinucleotide. The cellular coenzyme central to mitochondrial respiration and sirtuin signaling.`
- **PDP description:**
  > NAD+ is the cellular coenzyme central to mitochondrial respiration, sirtuin enzyme function, and DNA repair pathways. One of the most studied molecules in the longevity literature. Each batch is independently assayed for identity and purity.

### 13.6 MOTS-c (Longevity)

- **Card title:** `MOTS-c`
- **Card subtitle:** `40mg · lyophilized`
- **Card meta:** `Longevity · COA published`
- **PDP one-liner:** `A mitochondrial-derived peptide. Studied in AMPK signaling and metabolic homeostasis.`
- **PDP description:**
  > MOTS-c is a mitochondrially encoded peptide characterized in research on AMPK activation, glucose homeostasis, and metabolic adaptation. The deeper-cut SKU on our longevity shelf. Identity, purity, and lot prints on the vial; full COA on the product page.

### 13.7 Glutathione (Longevity / Adjacent)

- **Card title:** `Glutathione`
- **Card subtitle:** `200mg · 1500mg · lyophilized`
- **Card meta:** `Longevity · COA published`
- **PDP one-liner:** `The body's primary endogenous antioxidant tripeptide. Used in cellular protection and oxidative-stress research.`
- **PDP description:**
  > Glutathione is the body's primary endogenous antioxidant, a tripeptide of glutamate, cysteine, and glycine. Widely used in cellular protection and oxidative-stress research. The accessible price-point of our launch lineup; each batch independently assayed.

---

## 14. Catalog SKUs (17 visible at launch, not promoted)

Per [product architecture §3](product-architecture.md), 9 CATALOG SKUs ship live but are not promoted. Plus 1 PHASE 1.5 (Recovery Stack) that goes live on day 31. Each requires a one-line short description so the storefront does not show empty Bluum copy.

CTO instruction: **for each catalog SKU, set the Medusa `description` field to a single sentence in this template:**

> `[Molecule name] is a [molecule class / function]. Available for research use; each batch ships with a published Certificate of Analysis.`

Worked examples:

- **Ipamorelin (mono):** `Ipamorelin is a selective GHSR-1a agonist. Available for research use; each batch ships with a published Certificate of Analysis.`
- **CJC-1295 (No DAC) (mono):** `CJC-1295 (No DAC) is a GHRH analog. Available for research use; each batch ships with a published Certificate of Analysis.`
- **IGF-1 LR3:** `IGF-1 LR3 is a Long R3 analog of insulin-like growth factor 1. Available for research use; each batch ships with a published Certificate of Analysis.`
- **Sermorelin:** `Sermorelin is a 29-amino-acid GHRH analog. Available for research use; each batch ships with a published Certificate of Analysis.`
- **Hexarelin:** `Hexarelin is a synthetic hexapeptide GHSR agonist. Available for research use; each batch ships with a published Certificate of Analysis.`
- **Snap-8 (Acetyl Octapeptide-3):** `Snap-8 is an acetylated octapeptide studied in cosmetic and ECM research. Available for research use; each batch ships with a published Certificate of Analysis.`
- **Selank:** `Selank is a synthetic heptapeptide studied in anxiety and cognition research. Available for research use; each batch ships with a published Certificate of Analysis.`
- **Semax:** `Semax is a synthetic heptapeptide studied in cognition and neuroprotection research. Available for research use; each batch ships with a published Certificate of Analysis.`
- **DSIP:** `DSIP is a delta-sleep-inducing nonapeptide. Available for research use; each batch ships with a published Certificate of Analysis.`

CTO follows this template for the remaining catalog SKUs not enumerated; if a catalog SKU lacks a clean molecule class string, leave the existing seed description in place and **flag it in [SKA-11](/SKA/issues/SKA-11) follow-up** rather than guessing.

The 7 CUT SKUs ([product architecture §3](product-architecture.md): PT-141, GHRP-2, GHRP-6, Melanotan I, Melanotan II, AHK-Cu, plus the GLOW/KLOW collapse) are removed from the seed in [SKA-4](/SKA/issues/SKA-4) — no copy needed.

---

## 15. Email templates

The audit ([SKA-3 §3.8](../audit-2026-04.md)) confirmed templates are brand-agnostic. CMO ships the strings; CTO inserts.

### 15.1 Welcome email

- **Subject:** `Read the label.`
- **Preheader:** `What's in your CaliLean vial. And how to verify it.`
- **Body:**
  > Welcome to CaliLean.
  >
  > We sell research-grade peptides for the South Bay athlete who treats their body like a lab.
  >
  > Three things to know:
  >
  > 1. Every batch is third-party assayed. The COA lives on the product page and on the inner box flap.
  > 2. Your vial carries a lot number on the label. Match it to the COA before you open the box.
  > 3. Sold for research use only. Not for human consumption.
  >
  > The lineup: [link]
  > Read the lab notebook: [link to Education hub once live]
  >
  > — The CaliLean team
- **Footer:** `RUO_DISCLAIMER_SHORT`

### 15.2 Order confirmation

- **Subject:** `Order received. Lot details inside.`
- **Preheader:** `Your COA links and lot numbers.`
- **Body (after the standard order block):**
  > Thanks for the order.
  >
  > Each item ships with a Certificate of Analysis. Open the inner box flap to find the QR code, or click the COA link below per item.
  >
  > [Order block: per-item COA link + lot number]
  >
  > Your order ships from El Segundo. Standard delivery is 2 business days to most US addresses.
  >
  > Sold for research use only. Not for human consumption.
- **Footer:** `RUO_DISCLAIMER_SHORT`

### 15.3 Shipping confirmation

- **Subject:** `Shipped. Tracking inside.`
- **Preheader:** `Your CaliLean order is on the way.`
- **Body:**
  > Your order is on the way.
  >
  > Tracking: [carrier link]
  > Expected delivery: [carrier ETA]
  >
  > A reminder when it lands: open the inner box flap. Each vial's lot number matches the COA on the product page. If the lot number does not match, reply to this email before opening the vial.
  >
  > Sold for research use only. Not for human consumption.
- **Footer:** `RUO_DISCLAIMER_SHORT`

### 15.4 Cart abandonment / re-engagement

Out of scope for [SKA-11](/SKA/issues/SKA-11). The brand voice has not earned the right to nudge yet — we send these no earlier than day 31. CMO writes them in a separate ticket once founding-100 redeems.

### 15.5 Sender identity

- **From name:** `CaliLean`
- **From email:** `notifications@calilean.bio`
- **Reply-to:** `research@calilean.bio`

---

## 16. Microcopy

Catch-all for the small strings that show up across the storefront. CTO updates in place.

| Surface | Replace | With |
|---|---|---|
| Cart empty state | "Your cart is empty" (default Medusa) | `Nothing in your cart yet.` |
| Add-to-cart button | `Add to cart` | `Add to cart` (unchanged) |
| Sold-out badge | `Sold out` | `Out of stock` (signals catalog management, not "Black Friday rush") |
| Newsletter signup heading (if surfaced) | n/a | `Join the lab notebook list.` |
| Newsletter signup CTA | n/a | `Join` |
| Newsletter signup confirmation | n/a | `You're on the list.` |
| 404 heading | default | `This page isn't on the shelf.` |
| 404 body | default | `Try the lineup, or read the lab notebook.` |
| 404 CTA | default | `Back to the lineup` (links to `/store`) |
| 500 heading | default | `Something broke on our end.` |
| 500 body | default | `Refresh, or try again in a minute. If it persists, email research@calilean.bio.` |
| Search empty state | default | `No results. Try a molecule name (e.g. BPC-157, NAD+).` |
| Cart attestation hint (above CTA) | n/a | `By checking out, you confirm research use only.` |
| Account create headline | default | `Create your CaliLean account.` |
| Sign in headline | default | `Sign in to CaliLean.` |

---

## 17. Things explicitly out of scope for this doc

So nobody waits on me for them:

- **Wordmark / logo / typeface install.** [SKA-13](/SKA/issues/SKA-13) (designer) + CTO via `next/font`.
- **Color tokens / Tailwind theme rename.** [SKA-4](/SKA/issues/SKA-4) (CTO) using palette from [identity brief §7.1](identity-brief.md).
- **Image hosting migration off `bluumpeptides.com` CDN.** [SKA-4](/SKA/issues/SKA-4) Phase 2.
- **Per-SKU long-form copy for the launch 7.** Future Copywriter hire — what's in this doc is enough to ship the rebrand. The Copywriter brief is a CMO follow-up.
- **Education hub essays.** Three at launch, three more by day 60 ([launch narrative §1](launch-narrative.md)). Owned by the medical advisor + CMO edit.
- **About / Contact pages.** CMO follow-up ticket.
- **Lab book v1 and v2 print copy.** Founding-100 program — not on the storefront. Owned by CMO directly.
- **OOH / paid social creative copy.** [Hero campaign cuts in launch narrative §2](launch-narrative.md). Owned by CMO + Designer.

---

## 18. Acceptance checklist for [SKA-4](/SKA/issues/SKA-4)

Use this when the swap PR is ready for review:

- [ ] No string `Bluum`, `bluum`, `BLUUM`, `BluumLogo`, `bluumpeptides.com` survives in `storefront/src/`, `storefront/public/`, or seed JSON (the audit's 30-file / 182-occurrence list is the working surface).
- [ ] `RUODisclaimer` rendered on PDP (long), cart line + summary (short + inline), checkout, footer (long), and transactional email footers (short).
- [ ] Age gate uses `RUO_AGE_GATE_HEADLINE` + `RUO_AGE_GATE_BODY` constants from `lib/ruo.ts`.
- [ ] Hero, lab banner, value props, FAQ, footer match the strings in this doc verbatim. Adjective count and sentence-length rules pass.
- [ ] All 7 launch SKUs render the cards + PDP one-liners + short descriptions from §13.
- [ ] Catalog SKUs render the §14 template; cut SKUs are removed from seed.
- [ ] Welcome / order / shipping email subject + body match §15.
- [ ] No exclamation points anywhere in shipped strings. CMO will spot-check.

---

## Open items the CMO is tracking after this doc lands

| # | Item | Owner | Blocks |
|---|---|---|---|
| 1 | Confirm `calilean.bio` is the canonical domain and that `research@`, `support@`, `notifications@` aliases are provisioned | CEO | Footer + email sender + FAQ |
| 2 | Phone number decision (310 area code, or omit entirely) | CEO | Footer |
| 3 | Returns policy window (30 days assumed in trust badges) | CEO | PDP trust badges |
| 4 | Twitter/X handle reservation | CMO + CEO | Twitter card metadata |
| 5 | Education hub IA + first three essay briefs | CMO | Hero / FAQ links to "lab notebook" |
| 6 | About / Contact page copy | CMO | Footer Company column |
| 7 | Per-SKU long copy for the launch 7 | future Copywriter (post-hire) | Catalog depth, not launch |

---

## Changelog

- **v1 (2026-04-26)** — Initial draft, CMO. Aligned to identity brief v1.1 (RUO), launch narrative v1, product architecture v1. Replaces all Bluum-era placeholder copy across the storefront.
