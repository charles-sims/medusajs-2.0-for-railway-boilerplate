# CaliLean — Product Line Architecture (RUO)

> Author: CMO · Version: v2 · Date: 2026-04-26
> Companion docs: `docs/brand/identity-brief.md` (v1.1, RUO), `docs/brand/launch-narrative.md` (v1)
> Audience: CEO (ratified), CTO (storefront IA + nav), Designer (imagery), Copywriter (per-SKU long copy).
> **v2 changeset (board override, 2026-04-26):** Day 0 lineup expanded from 6 to **8 SKUs**. Retatrutide and Recovery Stack promoted to Day 0. Retatrutide pricing rebased to premium-of-premium. The §6 home shelf reordered.
> **Decisions in this doc are locked unless reopened by the CEO. Do not relitigate on storefront tickets.**

---

## 0. The frame

We inherited 33 SKUs from the Bluum seed (`storefront/src/data/products-seed.json`). 33 is not a lineup — it is a parts bin. **An informed researcher reading our shelf should be able to tell what kind of company we are within 8 seconds.** With 33 generic peptide SKUs they cannot. With 8 they can.

This document does three things:

1. **Audit** every one of the 33 seeded SKUs. Keep / cut / defer with reason.
2. **Pick a launch lineup** of 8 SKUs that tell a single coherent story across three categories.
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

## 2. The launch lineup (8 SKUs)

These eight, in this order, are the entire launch shelf. They map cleanly to the three categories and to the **Founding-100 lab book** trio (the three pillar SKUs that ship in every founding box, marked ★).

| # | SKU | Category | Story (2 sentences) | Launch price |
|---|---|---|---|---|
| 1 | **BPC-157** ★ | Repair | A 15-amino-acid pentadecapeptide derived from a gastric protective compound; widely studied in rodent models of tendon, ligament, and gut tissue repair. Sold for research use; the COA is published per batch. | **$89** (5mg) · $159 (10mg) · $279 (20mg) |
| 2 | **TB-500 (Thymosin β-4 fragment)** | Repair | A synthetic fragment of the actin-sequestering protein thymosin β-4, studied for cell migration and ECM remodeling alongside BPC-157. Often paired with BPC-157 in published soft-tissue repair models. | **$109** (5mg) · $189 (10mg) |
| 3 | **Recovery Stack (BPC-157 + TB-500)** | Repair | The two most-cited soft-tissue research peptides in a single research-use blend, dosed at 5mg/5mg per vial. Promoted as the Repair shelf anchor for researchers already running both monos. | **$229** (5mg / 5mg) |
| 4 | **GH Axis Stack — CJC-1295 + Ipamorelin** ★ | GH Axis | A research-use blend of a GHRH analog and a selective GHSR-1a agonist, used in published work on pulsatile GH release. Replaces the four redundant standalone SKUs that crowd this lane. | **$179** (5mg / 5mg) |
| 5 | **Retatrutide** | GH Axis (metabolic flagship) | A triple agonist (GLP-1R / GIPR / GCGR) studied in metabolic-pathway and energy-expenditure research. The most-cited new metabolic compound of the cycle, and the SKU the audience is already reading the paper on. | **$499** (15mg) · $899 (30mg) |
| 6 | **NAD+** ★ | Longevity | The cellular coenzyme central to mitochondrial respiration, sirtuin signaling, and DNA repair. The longevity audience already knows this molecule from Sinclair, Attia, and Huberman; we publish the assay on every batch. | **$139** (500mg) |
| 7 | **MOTS-c** | Longevity | A mitochondrial-derived peptide studied in AMPK signaling and metabolic homeostasis; one of the more rigorously characterized "longevity" compounds in current literature. The deep-cut SKU that signals we read papers, not Reddit. | **$229** (40mg) |
| 8 | **Glutathione** | Longevity (Adjacent) | The body's primary endogenous antioxidant tripeptide, used in cellular protection and oxidative-stress research. The accessible price-point SKU; the gateway from supplement-curious to research-curious. | **$69** (200mg) · $169 (1500mg) |

**Why eight.** Three SKUs in Repair (two monos + one stack), two in GH Axis (one research stack + one metabolic flagship), three in Longevity (one familiar pillar + one deep cut + one accessible entry). Two named stacks (Repair and GH Axis) anchor the Stack-as-promoted-SKU merchandising rule; both reveal-by-pathway, not by-molecule. The shelf reads as deliberate, fills three categories with conviction, and gives the founding-100 audience a clear way to start (lab-book trio = BPC-157, GH Axis Stack, NAD+).

**Why these eight and not others.** Three filters, applied in order:

1. **Brand fit.** Does it land on Repair / GH Axis / Longevity without a stretch? (Cuts: PT-141, Melanotan I/II, Selank, Semax, DSIP.)
2. **Literature density.** Is there enough peer-reviewed work that an informed researcher will find our COA + footnotes credible? (Cuts: AHK-Cu, Snap-8, Pinealon as launch leads.)
3. **Story collapse.** When two SKUs occupy the same lane, pick the one that tells the story cleanest. (Cuts: GHRP-2/6, Hexarelin, Sermorelin, TH9507, IGF-1 LR3, Mazdutide, Cagrilintide, AHK-Cu — all collapsed into the CJC + Ipa Stack or the Retatrutide flagship.)

### 2.1 Retatrutide on Day 0 — the case (board-confirmed)

Board overrode CEO's earlier hold and put Retatrutide on the Day 0 shelf. The brand case for that call:

- **It's the molecule the audience is already reading the paper on.** Retatrutide owns the metabolic-research conversation in this cycle — Lilly's own Phase 2 and 3 readouts have been the most-shared papers in the longevity/biohacker corner of media for three quarters. Holding it back means launching to an audience asking "where's the Reta?" instead of an audience asking "what's CaliLean?".
- **It's the SKU that anchors the catalog.** A $499 vial on the shelf raises the perceived ceiling of the entire lineup. Without it, BPC-157 at $89 and the GH Axis Stack at $179 read as "premium-ish." With it, they read as "the entry tier of a serious shelf."
- **It is the PR spike.** Day 0 with Retatrutide gets us a single coherent story for press: *"a research-grade compound shelf that does not pretend to be a clinic."* Day 31 splits the launch into two weaker beats.
- **The risk vector is regulatory, not brand.** The brand case is unambiguous; the regulatory risk is what gave CEO pause. That risk is owned by [SKA-2](/SKA/issues/SKA-2) (RUO compliance hardening — disclaimers, attestation, geo restrictions) and the pending board legal-counsel ask. CMO is *not* taking a position on whether legal is ready; CMO is saying that **if** legal posture is ratified by launch, the brand wants Reta on Day 0.

**Operating posture for Retatrutide copy:** treat as the most-scrutinized SKU on the shelf. Every claim cited; no speculative dosing schedule; the COA panel for Reta includes identity confirmation by LC-MS in addition to the standard purity + endotoxin panel (CTO/Ops to spec). This is the SKU regulators read first; it has to be the cleanest page on the site.

---

## 3. Full 33-SKU disposition

Every seeded SKU gets a verdict. Status values: **LAUNCH** (in the 8), **PHASE 2** (keep on roadmap, ship 30-90 days post-launch), **CATALOG** (live on the storefront from day 0 but not promoted), **CUT** (do not bring across the rebrand).

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
| 10 | BPC-157 / TB-500 Blend | **LAUNCH** | Recovery Stack (BPC-157 + TB-500) | Promoted to Day 0 in v2 to give the Repair shelf a stack anchor mirroring the GH Axis Stack. Both monos are also on Day 0, so COA parity is not a launch blocker. |
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

**Tally:** 8 LAUNCH · 0 PHASE 1.5 · 9 PHASE 2 · 9 CATALOG · 7 CUT.

That collapses the shelf from 33 SKUs to a **promoted lineup of 8**, a **catalog of 17 visible SKUs** at launch (8 LAUNCH + 9 CATALOG), and a **Phase 2 backlog of 9 SKUs**. The 7 cuts disappear from the rebrand entirely.

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

- **Premium index ≈ +60 to +140% over Bluum's seeded prices** for the LAUNCH lineup; **Retatrutide indexes higher** (+230%) as the premium-of-premium SKU (see §5.2.1). Catalog SKUs sit closer to a +30% bump.
- **Round to last-digit-9** (e.g. $89, $139, $339, $499, $899). Reads premium without reading sale-price.
- **Stacks priced at ~85% of the sum of their parts** at the same dose. Encourages the Stack as the promoted SKU but does not crater margin. (Worked: Recovery Stack 5/5mg = 0.85 × ($109 + $109) ≈ $185 → rounded up to $229 because the Stack carries a small premium for the merchandising slot it occupies. GH Axis Stack 5/5mg already at $179.)
- **No discounting in the first 90 days**, except: the founding-100 lab-book mailing (a fulfillment expense, not a discount), and the referral mechanic (`1 referral → 1 free 5mg vial for the friend`, which is a CAC line, not a discount).
- **Subscription = 12% off, monthly cadence, on the 6 SKUs that are credibly recurring** (BPC-157, TB-500, NAD+, Glutathione, GH Axis Stack, Recovery Stack). Retatrutide and MOTS-c are research-cadence, not monthly — no subscribe option at launch.

### 5.2 Launch prices (locked v2)

| SKU | Variant | Bluum seed | CaliLean launch | Δ |
|---|---|---|---|---|
| BPC-157 | 5mg | $40 | **$89** | +123% |
| BPC-157 | 10mg | implied | **$159** | — |
| BPC-157 | 20mg | implied | **$279** | — |
| TB-500 | 5mg | $45 | **$109** | +142% |
| TB-500 | 10mg | implied | **$189** | — |
| Recovery Stack (BPC + TB-500) | 5/5mg | $100 | **$229** | +129% |
| GH Axis Stack (CJC + Ipa) | 5/5mg | $75 | **$179** | +139% |
| **Retatrutide** | **15mg** | **$150** | **$499** | **+233%** |
| **Retatrutide** | **30mg** | implied | **$899** | **—** |
| NAD+ | 500mg | $60 | **$139** | +132% |
| MOTS-c | 40mg | $100 | **$229** | +129% |
| Glutathione | 200mg | $40 | **$69** | +73% |
| Glutathione | 1500mg | $40 | **$169** | +323% (multi-dose) |

Catalog (non-promoted) SKUs: rebase at +30% over seed, round to last-digit-9. Worked example: Snap-8 10mg $30 → $39; Selank 10mg $32 → $49; Sermorelin 5mg $30 → $49. CTO does not need a per-SKU table for catalog — the +30%/round-to-9 rule is enough.

### 5.2.1 Retatrutide as premium-of-premium (CMO call, locked)

Retatrutide is rebased from the v1 $339/$599 tier to **$499 (15mg) / $899 (30mg)**. CMO is taking the call and writing the case here.

**Why higher than the rest of the launch shelf:**

1. **Lowest price-elasticity SKU on the shelf.** The audience for Retatrutide is acutely demand-driven: they read the paper, they want the molecule, and they are already pricing it against compounded-GLP-1 retail ($600–$1,400/mo) and gray-market peptide vendors ($250–$600/vial with no COA). $499 lands cleanly between gray-market and compounded — and reads as the *trustworthy* option in that band.
2. **Single-SKU PR anchor.** When TechCrunch / Bloomberg / Bryan Johnson tweets describe CaliLean, they will quote one price. $499 (15mg of the most-discussed metabolic compound of the cycle, with a published triple-quad LC-MS COA) is a price journalists will name. $339 is not.
3. **Funds the COA scrutiny this SKU specifically requires.** Retatrutide will be the most-tested compound on the shelf because it's the most regulator-attention-grabbing. The premium funds: identity confirmation by LC-MS/MS triple-quad on every batch (not just purity by HPLC); independent endotoxin re-test; per-batch reference-standard comparison. Across the rest of the lineup we publish a standard purity panel; for Retatrutide we publish the full identity-confirmation packet. That costs real money per batch and the price has to carry it.
4. **Anchors the perceived ceiling.** A single $499 vial on the home shelf reframes BPC-157 at $89 from "premium-ish" to "entry-tier of a serious shelf." This is a real merchandising effect, not narrative — every catalog with a single high-anchor SKU sees lift on the mid-tier SKUs around it. We want that lift on the entire repair + longevity column.
5. **Subscription locked off — see §5.1.** This is not a recurring SKU. Re-buy cadence is research-driven (every 4–8 weeks per protocol), not monthly. We do not want to bake recurrence into the customer's expectation, and we do not want to discount the premium-of-premium tier under any subscription guise.

**Why not higher than $499:** Above $599 we cross into compounded-GLP-1 retail, which is a different regulatory and consumer-expectation category (an Rx framing the customer is intentionally walking away from when they choose RUO). $499 is the highest price we can hold without inviting the comparison.

**The 30mg variant at $899** is not 2× the 15mg — that's intentional. Doubling the unit cost on the larger vial is gray-market voice. $899/$499 ≈ 1.80× preserves the premium-of-premium read and gives the serious researcher a small dose-economy reason to buy the larger vial without crashing per-mg margin.

### 5.3 What I am explicitly *not* doing

- **No "intro pricing" / "founder pricing" / "Black Friday" anywhere in year 1.** Erodes the trust premise immediately.
- **No bundles beyond the two named Stacks.** "Buy 2, save 10%" is supplement-aisle voice.
- **No price testing.** Pick the price, hold it, ratify the COGS, move on. We are not a price-elastic category for this audience.

---

## 6. Storefront IA — what CTO ships

This is the order. CTO renders the home shelf, the nav, and the product list pages in this exact priority. Future merchandiser changes go through CMO.

```
Home shelf (above the fold):
  1. Retatrutide          ← hero slot, premium-of-premium anchor
  2. BPC-157              ★
  3. GH Axis Stack        ★
  4. NAD+                 ★
  (Retatrutide leads as the PR-anchor SKU; lab-book trio fills the
   remaining above-fold slots and sets the founding-100 narrative.)

Home shelf (below the fold):
  5. Recovery Stack
  6. TB-500
  7. MOTS-c
  8. Glutathione

Nav order:
  Repair  →  GH Axis  →  Longevity  →  Adjacent  →  Education  →  COA library
```

Adjacent / Catalog SKUs render on category pages but **not on the home shelf and not in primary nav callouts**. They are findable. They are not promoted.

**On the Retatrutide hero slot.** Putting the highest-priced SKU first violates the conventional "lowest-friction-first" merchandising rule. We're doing it on purpose: Retatrutide is the headline molecule, the press anchor, and the perceived-ceiling SKU. The first impression of the shelf has to be "this is a serious metabolic-research catalog," not "this is a recovery-peptide store with a Reta page." The lab-book trio (BPC-157, GH Axis Stack, NAD+) immediately follows to do the founding-100 conversion work; Retatrutide does the brand work.

---

## 7. Status of decisions (v2)

### Locked

| # | Decision | Owner | Status |
|---|---|---|---|
| 1 | Day 0 launch lineup = the 8 in §2 | CMO + Board | **Locked** |
| 2 | Retatrutide on Day 0 | Board (override) | **Locked** |
| 3 | Recovery Stack on Day 0 | CMO | **Locked** |
| 4 | Pricing table §5.2, including Retatrutide premium-of-premium ($499 / $899) | CMO + CEO | **Locked** |
| 5 | Subscription set = 6 SKUs (BPC-157, TB-500, NAD+, Glutathione, GH Axis Stack, Recovery Stack) | CMO | **Locked** |
| 6 | Home shelf order in §6 | CMO | **Locked** |
| 7 | Naming and labeling rules in §4 | CMO | **Locked** |
| 8 | Category structure (Repair / GH Axis / Longevity / Adjacent) | CMO | **Locked** |
| 9 | 33-SKU disposition table in §3 | CMO | **Locked** |

### Open / handed off

| # | Item | Owner | Notes |
|---|---|---|---|
| A | Legal counsel for ToS / privacy / attestation | Board (escalated on [SKA-1](/SKA/issues/SKA-1)) | Hard gate before launch. Retatrutide PDP cannot publish until counsel signs off on attestation flow. |
| B | RUO compliance — disclaimer, geo, attestation | CTO ([SKA-2](/SKA/issues/SKA-2)) | Retatrutide-specific copy treatment requested below. |
| C | Imagery — Retatrutide hero + lab-book trio | Designer ([SKA-14](/SKA/issues/SKA-14)) | Imagery brief priority reordered for v2. Hero slot = Retatrutide vial. |
| D | Per-SKU long copy + COA citations | CMO → Copywriter (pending hire) | CMO drafts launch-shelf copy; Copywriter takes catalog + iterates. |
| E | LC-MS/MS triple-quad COA panel for Retatrutide | CTO / Ops | Premium-of-premium pricing assumes this panel ships with the SKU. |

Architecture is locked. Storefront tickets implement this; do not relitigate.
