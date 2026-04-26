# CaliLean — Product Line Architecture (RUO)

> Author: CMO · Version: v1 · Date: 2026-04-26
> Companion docs: `docs/brand/identity-brief.md` (v1.1, RUO), `docs/brand/launch-narrative.md` (v1)
> Audience: CEO (final pricing call), CTO (storefront IA + nav), future Copywriter (per-SKU long copy).
> **Decisions in this doc are locked unless reopened by the CEO. Do not relitigate on storefront tickets.**

---

## 0. The frame

We inherited 33 SKUs from the Bluum seed (`storefront/src/data/products-seed.json`). 33 is not a lineup — it is a parts bin. **An informed researcher reading our shelf should be able to tell what kind of company we are within 8 seconds.** With 33 generic peptide SKUs they cannot. With 7 they can.

This document does three things:

1. **Audit** every one of the 33 seeded SKUs. Keep / cut / defer with reason.
2. **Pick a launch lineup** of 7 SKUs that tell a single coherent story across three categories.
3. **Set pricing direction** for the CEO to ratify.

Posture is **research-use-only** (per [SKA-2](/SKA/issues/SKA-2)). All copy is research-context. No therapeutic claims. No "what it does for you." Every SKU page reads like a CRO catalog wearing a coastal jacket.

---

## 1. Category structure (3 + 1)

We launch with three primary categories. A fourth ("Adjacent") absorbs everything we keep but de-feature.

| Category | What it is | What it kills |
|---|---|---|
| **Repair** | Tissue, ECM, soft-tissue, gut. The "after the workout" lane. | "Recovery drinks" voice. Heat/ice metaphors. |
| **GH Axis** | Growth-hormone pathway research compounds: GHRH analogs, GH secretagogues, IGF-1 pathway. | "Anti-aging" cosplay. Bodybuilder forum aesthetics. |
| **Longevity** | Mitochondrial function, NAD biology, cellular aging. | "Live forever" hyperbole. Bryan-Johnson cosplay. |
| Adjacent | Cognition, sleep, metabolic, immune. Catalog SKUs we keep but don't lead with. | Lifestyle merch creep. |

That is also the **storefront nav** order: Repair → GH Axis → Longevity → Adjacent. Three pillars first, drawer of niche SKUs second.

---

## 2. The launch lineup (7 SKUs)

These seven, in this order, are the entire launch shelf. They map cleanly to the three categories and to the **Founding-100 lab book** trio (the three pillar SKUs that ship in every founding box, marked ★).

| # | SKU | Category | Story (2 sentences) | Launch price |
|---|---|---|---|---|
| 1 | **BPC-157** ★ | Repair | A 15-amino-acid pentadecapeptide derived from a gastric protective compound; widely studied in rodent models of tendon, ligament, and gut tissue repair. Sold for research use; the COA is published per batch. | **$89** (5mg) · $159 (10mg) · $279 (20mg) |
| 2 | **TB-500 (Thymosin β-4 fragment)** | Repair | A synthetic fragment of the actin-sequestering protein thymosin β-4, studied for cell migration and ECM remodeling alongside BPC-157. Often paired with BPC-157 in published soft-tissue repair models. | **$109** (5mg) · $189 (10mg) |
| 3 | **GH Axis Stack — CJC-1295 + Ipamorelin** ★ | GH Axis | A research-use blend of a GHRH analog and a selective GHSR-1a agonist, used in published work on pulsatile GH release. Replaces the four redundant standalone SKUs that crowd this lane. | **$179** (5mg / 5mg) |
| 4 | **Retatrutide** | GH Axis (Adjacent metabolic) | A triple agonist (GLP-1R / GIPR / GCGR) studied in metabolic-pathway and energy-expenditure research. The most cited new metabolic compound of the cycle; a launch SKU because the audience is already reading the paper. | **$339** (15mg) · $599 (30mg) |
| 5 | **NAD+** ★ | Longevity | The cellular coenzyme central to mitochondrial respiration, sirtuin signaling, and DNA repair. The longevity audience already knows this molecule from Sinclair, Attia, and Huberman; we publish the assay on every batch. | **$139** (500mg) |
| 6 | **MOTS-C** | Longevity | A mitochondrial-derived peptide studied in AMPK signaling and metabolic homeostasis; one of the more rigorously characterized "longevity" compounds in current literature. The deep-cut SKU that signals we read papers, not Reddit. | **$229** (40mg) |
| 7 | **Glutathione** | Longevity (Adjacent) | The body's primary endogenous antioxidant tripeptide, used in cellular protection and oxidative-stress research. The accessible price-point SKU; the gateway from supplement-curious to research-curious. | **$69** (200mg) · $169 (1500mg) |

**Why seven, not five and not eight.** Five does not fill three categories with conviction. Eight forces a weak SKU into the shelf to fill a slot. Seven is two-per-category plus one accessible entry. The shelf reads as deliberate without reading as thin.

**Why these seven and not others.** Three filters, applied in order:

1. **Brand fit.** Does it land on Repair / GH Axis / Longevity without a stretch? (Cuts: PT-141, Melanotan I/II, Selank, Semax, DSIP.)
2. **Literature density.** Is there enough peer-reviewed work that an informed researcher will find our COA + footnotes credible? (Cuts: AHK-Cu, Snap-8, Pinealon as launch leads.)
3. **Story collapse.** When two SKUs occupy the same lane, pick the one that tells the story cleanest. (Cuts: GHRP-2/6, Hexarelin, Sermorelin, TH9507, IGF-1 LR3, Mazdutide, Cagrilintide, AHK-Cu — all collapsed into the CJC + Ipa Stack or the Retatrutide flagship.)

---

## 3. Full 33-SKU disposition

Every seeded SKU gets a verdict. Status values: **LAUNCH** (in the 7), **PHASE 2** (keep on roadmap, ship 30-90 days post-launch), **CATALOG** (live on the storefront from day 0 but not promoted), **CUT** (do not bring across the rebrand).

| # | Bluum title | Verdict | Rename to | Reason |
|---|---|---|---|---|
| 1 | BPC-157 | **LAUNCH** ★ | BPC-157 | Flagship Repair SKU. Lab-book pillar. |
| 2 | TH9507 | PHASE 2 | Tesamorelin (TH-9507) | GH-axis lane already filled by the CJC + Ipa Stack. Lipodystrophy framing is off-pillar. Revisit as a metabolic-research SKU in Phase 2. |
| 3 | Ipamorelin | CATALOG | Ipamorelin (mono) | Standalone available for researchers who want to titrate; promoted SKU is the Stack. Keep on shelf, not in nav highlights. |
| 4 | TB-500 | **LAUNCH** | TB-500 (Thymosin β-4 fragment) | Pairs with BPC-157 in literature. Completes Repair. |
| 5 | GHK-Cu | PHASE 2 | GHK-Cu | Cosmetic / dermal-research angle is real but on-brand only if we add a Cosmetic Research category in v2. |
| 6 | PT-141 | **CUT** | — | Sexual-function framing collides with launch-shelf seriousness. The vial photo on a researcher's bench is fine; the shelf placement is wrong. Reopen no earlier than month 6. |
| 7 | Glutathione | **LAUNCH** | Glutathione | Accessible entry SKU. Also the most familiar molecule to the supplement-curious cohort we're converting. |
| 8 | GLOW | PHASE 2 | (rename required) | Blend names "GLOW" and "KLOW" are vendor-supplier slang and read sketchy. Either rename to a research description (e.g. "ECM Repair Blend") or keep dark until v2. Default: dark. |
| 9 | KLOW | PHASE 2 | (rename required) | Same as GLOW. |
| 10 | BPC-157 / TB-500 Blend | PHASE 1.5 | Recovery Stack (BPC-157 + TB-500) | Hold for ~Day 31 release alongside general access opening. Stack story works once the monos have published COAs the customer trusts. |
| 11 | NAD+ | **LAUNCH** ★ | NAD+ | Longevity hero. Lab-book pillar. |
| 12 | Snap-8 | CATALOG | Snap-8 (Acetyl Octapeptide-3) | Cosmetic ECM SKU; small but defensible. Live on shelf, not promoted. |
| 13 | Selank | CATALOG | Selank | Cognition/anxiety research; legitimate but niche for launch. Catalog now, candidate for a v2 Cognition category. |
| 14 | Cagrilintide | PHASE 2 | Cagrilintide | Amylin analog — interesting metabolic-research SKU but redundant with Retatrutide as the launch flagship. Phase 2 metabolic. |
| 15 | Thymosin Alpha-1 | PHASE 2 | Thymosin α-1 | Immune-modulation research story is good. Save for an Immune category in Phase 2. |
| 16 | IGF-1 LR3 | CATALOG | IGF-1 LR3 | Available for the GH-pathway researcher who specifically wants the IGF arm; not promoted at launch. |
| 17 | Hexarelin | CATALOG | Hexarelin | Older-gen GHSR agonist; superseded by Ipamorelin in our promoted Stack. Catalog only. |
| 18 | CJC-1295 No DAC | CATALOG | CJC-1295 (No DAC) | Standalone available; promoted SKU is the Stack. |
| 19 | Sermorelin | CATALOG | Sermorelin | Older GHRH analog. Catalog only; superseded by CJC-1295 in the Stack. |
| 20 | GHRP-2 | **CUT** | — | Older-gen GHSR; redundant with Ipamorelin. Reduces shelf clutter. |
| 21 | GHRP-6 | **CUT** | — | Same as GHRP-2. |
| 22 | Retatrutide | **LAUNCH** | Retatrutide | Metabolic flagship. The most-discussed new compound in the audience's media diet. |
| 23 | Melanotan I | **CUT** | — | "Tanning" framing collides with the longevity story we tell at the same moment. Reopen never, or under a separate sub-brand. |
| 24 | Melanotan II | **CUT** | — | Same as Melanotan I, with additional aphrodisiac framing that compounds the off-pillar problem. |
| 25 | Mazdutide | PHASE 2 | Mazdutide | GLP-1/GCGR dual; real molecule but redundant with Retatrutide as our flagship. Phase 2 metabolic deep cut. |
| 26 | Semax | CATALOG | Semax | Cognition research SKU; legitimate but niche. Catalog now, v2 Cognition category. |
| 27 | DSIP | CATALOG | DSIP (Delta Sleep-Inducing Peptide) | Sleep-regulation research; v2 Sleep category candidate. Catalog at launch. |
| 28 | Epithalon | PHASE 2 | Epithalon | Longevity literature is interesting (telomerase, pineal). Phase 2 Longevity expansion. |
| 29 | AHK-Cu | **CUT** | — | Redundant with GHK-Cu and weaker literature. Reduces clutter. |
| 30 | MOTS-C | **LAUNCH** | MOTS-c | Longevity deep-cut. Signals we read papers. |
| 31 | Pinealon | PHASE 2 | Pinealon | Khavinson-school tripeptide; real research base but Russian-literature-heavy and harder to footnote in our voice. Phase 2. |
| 32 | 5-Amino-1MQ | PHASE 2 | 5-Amino-1MQ | NNMT-inhibitor metabolic-research SKU; interesting but obscure for launch. Phase 2 metabolic. |
| 33 | CJC-1295 No DAC / Ipamorelin Blend | **LAUNCH** ★ | GH Axis Stack (CJC-1295 + Ipamorelin) | The current SKU title is a parts list. The promoted SKU is the **Stack**, named for the pathway, not the molecules. |

**Tally:** 7 LAUNCH · 1 PHASE 1.5 · 9 PHASE 2 · 9 CATALOG · 7 CUT.

That collapses the shelf from 33 SKUs to a **promoted lineup of 7**, a **catalog of 17 visible SKUs** at launch (7 LAUNCH + 9 CATALOG + 1 PHASE 1.5 holding for day 31), and a **Phase 2 backlog of 9 SKUs**. The 7 cuts disappear from the rebrand entirely.

---

## 4. Naming and labeling rules

These are not suggestions. CTO and Copywriter follow them.

1. **Generic / chemical name first, brand-friendly framing in the subtitle.** Right: `BPC-157 — 5mg lyophilized`. Wrong: `RecoveryMax™`.
2. **Stacks are named after the pathway, not the molecules.** Right: `GH Axis Stack`. Wrong: `CJC-1295 No DAC / Ipamorelin Blend`. The molecules go in the subtitle and on the COA.
3. **No symbol-laden "GLOW / KLOW / BLOW" supplier names.** If a vendor blend has one of these names, rename it before listing. Default if unsure: keep dark.
4. **No mg in the title.** Mg goes in the variant. Title is the molecule, the variant is the dose.
5. **No therapeutic claims in titles or subtitles.** "BPC-157 — 5mg lyophilized" is allowed. "BPC-157 — Recovery Peptide" is not.
6. **CAS number, molecular weight, and PubChem ID always render on the PDP** (already in seeded metadata; CTO ensures the template surfaces them).

---

## 5. Pricing direction

Current Bluum pricing is mid-market and does not match the CaliLean audience. The South Bay $250k+ HHI customer is **trust-shopping, not price-shopping**. Premium pricing also funds the third-party assay budget that *is* our actual moat.

### 5.1 Pricing principles

- **Premium index ≈ +60 to +120% over Bluum's seeded prices** for the LAUNCH lineup. Catalog SKUs sit closer to a +30% bump.
- **Round to $X9** (e.g. $89, $139, $339). Reads premium without reading sale-price.
- **Stacks priced at ~85% of the sum of their parts** at the same dose. Encourages the Stack as the promoted SKU but does not crater margin.
- **No discounting in the first 90 days**, except: the founding-100 lab-book mailing (a fulfillment expense, not a discount), and the referral mechanic (`1 referral → 1 free 5mg vial for the friend`, which is a CAC line, not a discount).
- **Subscription = 12% off, monthly cadence, on the 5 SKUs that are credibly recurring** (BPC, TB-500, NAD+, Glutathione, the Stack). Retatrutide and MOTS-C are research-cadence, not monthly — no subscribe option at launch.

### 5.2 Recommended launch prices (CEO ratifies)

| SKU | Variant | Bluum seed | CaliLean launch | Δ |
|---|---|---|---|---|
| BPC-157 | 5mg | $40 | **$89** | +123% |
| BPC-157 | 10mg | implied | **$159** | — |
| BPC-157 | 20mg | implied | **$279** | — |
| TB-500 | 5mg | $45 | **$109** | +142% |
| TB-500 | 10mg | implied | **$189** | — |
| GH Axis Stack (CJC + Ipa) | 5/5mg | $75 | **$179** | +139% |
| Retatrutide | 15mg | $150 | **$339** | +126% |
| Retatrutide | 30mg | implied | **$599** | — |
| NAD+ | 500mg | $60 | **$139** | +132% |
| MOTS-c | 40mg | $100 | **$229** | +129% |
| Glutathione | 200mg | $40 | **$69** | +73% |
| Glutathione | 1500mg | $40 | **$169** | +323% (multi-dose) |
| Recovery Stack (BPC + TB-500) | 5/5mg, day 31 | $100 | **$229** | +129% |

Catalog (non-promoted) SKUs: rebase at +30% over seed, round to $X9. Worked example: Snap-8 10mg $30 → $39; Selank 10mg $32 → $49; Sermorelin 5mg $30 → $49. CTO does not need a per-SKU table for catalog — the +30%/round-to-9 rule is enough.

### 5.3 What I am explicitly *not* doing

- **No "intro pricing" / "founder pricing" / "Black Friday" anywhere in year 1.** Erodes the trust premise immediately.
- **No bundles beyond the two named Stacks.** "Buy 2, save 10%" is supplement-aisle voice.
- **No price testing.** Pick the price, hold it, ratify the COGS, move on. We are not a price-elastic category for this audience.

---

## 6. Storefront IA — what CTO ships

This is the order. CTO renders the home shelf, the nav, and the product list pages in this exact priority. Future merchandiser changes go through CMO.

```
Home shelf (above the fold):
  1. BPC-157
  2. GH Axis Stack
  3. NAD+
  (the lab-book trio. Each links to its long copy + COA.)

Home shelf (below the fold):
  4. TB-500
  5. Retatrutide
  6. MOTS-c
  7. Glutathione

Nav order:
  Repair  →  GH Axis  →  Longevity  →  Adjacent  →  Education  →  COA library
```

Adjacent / Catalog SKUs render on category pages but **not on the home shelf and not in primary nav callouts**. They are findable. They are not promoted.

---

## 7. Open items for CEO

I am the decider on naming, lineup composition, and category structure. The following are **CEO calls** and I am recommending, not deciding:

1. **Final pricing ratification** (table in §5.2). I recommend approve as-is.
2. **Whether to ship Retatrutide on Day 0 or hold to Day 31.** It is the most regulator-attention-grabbing molecule on the shelf. I recommend Day 0 — the audience is reading the paper this quarter, not next quarter — but if legal posture warrants caution, hold it 30 days.
3. **Whether the Recovery Stack (BPC + TB-500) ships Day 31 or Day 0.** I recommended Day 31 to give monos a chance to anchor trust first. Reasonable to argue Day 0; defer to CEO.

Everything else in this doc is locked. Ship it.
