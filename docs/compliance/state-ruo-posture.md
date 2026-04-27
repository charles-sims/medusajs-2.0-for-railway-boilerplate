# State-by-State RUO Posture Map — Peptide DTC

> **Author:** Compliance · **Date:** 2026-04-26 · **Branch:** `compliance/state-ruo-posture-ska25`
> **Issue:** SKA-25 · **Parent:** SKA-1 · **Feeds:** SKA-26 (counsel question list)
>
> **This document is research + synthesis, NOT legal advice.** Statute citations are primary-source references gathered for triage; nothing here should be relied on without review by a US-licensed attorney with food/drug/pharmacy experience in each named state. All "ship / ship-with-extra-disclaimer / suppress" recommendations below are operational risk calls based on publicly available regulatory posture as of April 2026, not legal opinions.

## TL;DR

CaliLean ships peptides under a **research-use-only (RUO)** posture: SKU labeling, footer/PDP disclaimer (`"For research use only. Not for human consumption."`), 21+ age gate, and a checkout attestation that records `RUO_ATTESTATION_VERSION` against the order (see `storefront/src/lib/ruo.ts`, `backend/src/subscribers/ruo-attestation-audit.ts`). ToS §3 includes the RUO carve-out and §13 governs disputes under California law.

Across the 10 priority states surveyed, **no state currently bans the sale of RUO-labeled peptides outright** to non-licensed buyers. Risk concentrates in three vectors: (1) state drug-wholesaler / out-of-state-shipper **registration** requirements, (2) state attorney-general **consumer-protection / false-advertising** actions where RUO labeling is alleged to be a sham, and (3) state **board-of-pharmacy** enforcement that can reach non-pharmacy DTC sellers if a product is treated as a "drug" requiring an Rx.

**Day-0 ship recommendation: ship to all 10 priority states.** No state is a clear-enough loss-making jurisdiction to justify suppression on day 0 given the existing RUO surface. Two states (NJ, MA) warrant a follow-up in <30 days for registration-licensing posture before we scale spend in those geos.

## Top-3 Highest-Risk States (priority for counsel review)

1. **New Jersey** — NJ Drug, Device and Cosmetic Act (NJSA 24:6B / 24:6C) and NJ Wholesale Drug Distributor regs require out-of-state firms shipping "drugs" into NJ to register; AG Platkin has run active false-advertising actions against supplement/health DTC firms. **Highest registration-risk state in the priority list.**
2. **Massachusetts** — Post-NECC, MA DPH and Board of Pharmacy interpret "drug" expansively under MGL c.94 §187 and c.94C; the state has a culture of aggressive enforcement against compounders and adjacent DTC sellers. **Highest interpretive-risk state.**
3. **California (HQ)** — Cal Health & Safety Code §109875+ and Bus. & Prof. Code §4000+ (Pharmacy Law) plus an active AG and DA bench. As HQ, CA is the most likely venue for any enforcement action even when the customer is elsewhere. RUO peptide vendors operate openly in CA, but our HQ status raises the cost of an AG inquiry. **Highest jurisdictional-exposure state.**

## Recommended Day-0 Geo-Suppress List

**None.** Ship to all 10 priority states + rest-of-US on day 0 with the existing RUO surface. Two states get a 30-day follow-up flag (see §"Per-state matrix" below):

- **NJ** — verify whether out-of-state shippers of RUO-labeled (non-Rx, non-controlled) peptides need to register with the NJ Division of Consumer Affairs Drug Control Unit before scaling spend there.
- **MA** — verify whether the MA Board of Pharmacy treats RUO-labeled peptides as "drugs" subject to MGL c.94C licensing for an out-of-state DTC seller.

These verifications are **counsel questions**, not day-0 blockers. The conservative alternative — suppressing NJ + MA preemptively — is rejected per the SKA-25 constraint that we ship unless evidence is overwhelming.

## Per-State Matrix

Columns: **State** · **Statute / board citation** · **RUO-specific guidance?** · **Recent enforcement (≤3y)** · **Posture** · **Rationale**.

`Posture` legend: **Ship** = default RUO surface is sufficient. **Ship+** = ship with the existing surface but flag for counsel follow-up before scaling. **Suppress** = do not accept orders from this state on day 0.

| State | Statute / board | RUO-specific guidance? | Recent enforcement (≤3y) | Posture | Rationale |
|---|---|---|---|---|---|
| **CA** (HQ) | Cal Health & Safety Code §§109875–111815 (Sherman Food, Drug, and Cosmetic Law); Cal Bus. & Prof. Code §§4000+ (Pharmacy Law); CA Board of Pharmacy | **No** RUO-specific carve-out in Sherman. Sherman defines "drug" broadly; FDA-style intended-use doctrine generally applies. | CA AG and LA County DA active on telehealth GLP-1 compounding (2024–2025). No RUO-vendor action surfaced in priority research; many RUO peptide vendors HQ'd in CA. | **Ship+** | HQ jurisdiction = highest cost-of-inquiry. RUO surface is industry-typical; existing checkout attestation + ToS §13 (CA governing law) reduces dispute friction. Counsel question: is Sherman §111550 (misbranding) reachable when RUO labeling is on label and matches marketing? |
| **NY** | NY Education Law Art. 137 (pharmacy) & Art. 138 (controlled substances); NY Pub. Health Law Art. 33; NY Gen. Bus. Law §§349–350 (consumer protection) | **No** RUO-specific carve-out. NY DOH and Board of Pharmacy interpret "drug" via NY Educ. Law §6802(8). | NY AG (James) very active on health-claim DTC and supplements (2023–2025). No surfaced RUO peptide action. | **Ship** | Risk is concentrated in marketing-claim space, not RUO-label-itself space. Existing RUO copy avoids therapeutic claims. Monitor for NY AG sweeps. |
| **FL** | Fla. Stat. ch. 499 (Fla. Drug and Cosmetic Act); FL DOH Drugs, Devices & Cosmetics Program; FL Board of Pharmacy under ch. 465 | **No** RUO-specific carve-out. Ch. 499.005 misbranding rules track FFDCA. | FL DBPR and AG active on telehealth GLP-1 (2024–2025). Several FL-domiciled peptide DTCs operate openly. | **Ship** | FL is permissive for RUO-labeled peptides at the DTC layer. Risk surface is similar to other Southern states. |
| **TX** | Tex. Health & Safety Code ch. 431 (Tex. Food, Drug, and Cosmetic Act); Tex. Occupations Code ch. 551–569 (Pharmacy Act); TX State Board of Pharmacy | **No** RUO-specific carve-out. Ch. 431.021 misbranding tracks FFDCA. | TX SBP has acted on peptide compounding pharmacies (2024). No surfaced RUO DTC action. | **Ship** | TX is permissive of supplements and adjacent products at the DTC layer. RUO surface is sufficient. |
| **IL** | 410 ILCS 620 (IL Food, Drug and Cosmetic Act); 225 ILCS 85 (Pharmacy Practice Act); IL Dept. of Financial & Professional Regulation | **No** RUO-specific carve-out. | IL AG active on consumer-protection sweeps; no surfaced RUO peptide action. | **Ship** | Standard risk profile. RUO surface is sufficient. |
| **MA** | MGL c.94 §§186–195 (food, drugs, cosmetics); MGL c.94C (controlled substances); MGL c.112 §§24–42A (pharmacy); MA Board of Registration in Pharmacy | **No** RUO-specific carve-out. MA interprets "drug" expansively post-NECC (2012 compounding tragedy reshaped MA enforcement culture). | MA Board of Pharmacy and AG very active on compounding-pharmacy adjacent enforcement (2023–2025). | **Ship+** | Highest interpretive-risk state. Counsel question: does MA Board of Pharmacy have authority to reach an out-of-state RUO DTC seller under MGL c.94C? Continue to ship; verify before scaling MA-targeted spend. |
| **WA** | RCW 69.04 (Intrastate Commerce in Food, Drugs, and Cosmetics); RCW 18.64 (Pharmacy); WA State Board of Pharmacy | **No** RUO-specific carve-out. RCW 69.04.080+ misbranding tracks FFDCA. | WA Board of Pharmacy active on compounding (2024). WA AG (Brown, succeeded Ferguson) has active CPA enforcement; no surfaced RUO action. | **Ship** | Standard risk profile. RUO surface is sufficient. |
| **NJ** | NJSA 24:6B (Drug, Device and Cosmetic Act); NJSA 45:14 (Pharmacy); NJ Div. of Consumer Affairs Drug Control Unit; NJ State Board of Pharmacy | **No** RUO-specific carve-out. NJ is one of the more aggressive states on out-of-state-shipper drug-wholesaler registration. | NJ AG (Platkin) very active 2023–2025 on supplement and health-claim DTC. NJ has historically required out-of-state drug shippers to hold a Drug Wholesaler / Manufacturer registration. | **Ship+** | Highest registration-risk state in the priority list. Counsel question: do RUO-labeled (non-Rx, non-controlled) peptides trigger NJ Drug Wholesaler / Manufacturer registration when shipped from CA to a NJ consumer? If yes, registration is the unblock — not suppression. |
| **PA** | 35 P.S. §§780-101+ (Pharmacy Act / Drug, Device and Cosmetic Act); 63 P.S. §§390-1+ (Pharmacy Act); PA State Board of Pharmacy; PA Dept. of Health | **No** RUO-specific carve-out. | PA AG active on consumer protection; no surfaced RUO peptide action. | **Ship** | Standard risk profile. PA Wholesale Drug Distributor licensing applies to drugs but not clearly to RUO-labeled non-Rx; counsel verification recommended within 60 days. |
| **GA** | OCGA Title 26 ch. 4 (Pharmacy and Drugs); GA Drugs and Narcotics Agency (GDNA); GA Board of Pharmacy | **No** RUO-specific carve-out. | GDNA has acted on peptide-compounding clinics (2024); no surfaced RUO DTC action. | **Ship** | Standard risk profile. RUO surface is sufficient. |
| **Rest of US (rollup)** | Each state has its own "little FDCA" + pharmacy act. | Not surveyed individually. | n/a | **Ship** | Default to ship. Two non-priority watch-list states are called out below. |

### Rest-of-US watch list (non-priority, surfaced via spot-check)

These are not in the 10-state priority but are flagged because they have unusual posture worth a 60–90-day counsel review if order volume materializes:

- **Louisiana** — LA RS 40:961+ has a history of aggressive scheduling of "research" / "designer" chemicals. Worth verifying that named peptides on the CaliLean shelf (Retatrutide first; Tirzepatide, Semaglutide, Ipamorelin, BPC-157, etc. on the roadmap) are not on any LA-specific scheduling list.
- **New York City** (sub-state) — NYC Dept. of Consumer and Worker Protection has historically run independent enforcement sweeps on supplement DTC. State-level guidance covers; just be aware NYC adds a sub-jurisdiction for any storefront retail.
- **Indiana / Mississippi / South Dakota** — all three have done unusual scheduling of "research chemicals" historically. RUO peptides on our shelf are not analogues of scheduled substances, so risk is low — but mention for completeness.

## What I could not determine without licensed counsel (feeds SKA-26)

These are the questions that should drive the SKA-26 counsel question list. Each is a "I have a working hypothesis but cannot verify without primary state-level legal review":

1. **NJ Drug Wholesaler registration** — does shipping an RUO-labeled, non-Rx, non-controlled peptide from CA to a NJ consumer trigger NJ Drug Wholesaler / Manufacturer registration under NJSA 24:6B? If yes, what's the registration cost and timeline?
2. **MA "drug" reach** — does MA Board of Pharmacy assert jurisdiction over an out-of-state RUO DTC seller under MGL c.94C, and is RUO labeling a defense or is intended-use doctrine controlling?
3. **CA Sherman misbranding** — is RUO labeling on the SKU + on PDP + on checkout attestation a sufficient bar to a §111550 misbranding claim, or does CA apply intended-use doctrine through marketing context (e.g., site name "CaliLean," brand voice, athlete imagery)?
4. **NY Gen. Bus. Law §349** — what's the threshold for an NY AG action on a CA-domiciled DTC under NY's broad consumer-protection statute, given current marketing copy?
5. **PA Wholesale Drug Distributor** — does shipping RUO peptides into PA require PA Wholesale Drug Distributor licensing under 35 P.S. §§780-101+?
6. **Multi-state out-of-state-shipper licensing** — is there any state in the rollup (beyond the 10 priorities) where shipping a non-Rx, non-controlled, RUO-labeled product triggers a registration requirement we'd hit at any DTC scale?
7. **Peptide-specific scheduling** — does any state schedule any of the named CaliLean peptides (Retatrutide first; Tirzepatide, Semaglutide, Ipamorelin, BPC-157, MOTS-c, GHK-Cu on the roadmap) under a state-specific controlled-substances act, regardless of FDA federal scheduling?
8. **FDA RUO labeling sufficiency** — is RUO labeling the federal defense it appears to be in front of FDA OCI / FTC, or is intended-use doctrine controlling at the federal layer in a way that would inform state-level posture?
9. **Adversarial scenarios** — if FDA or a state issues a warning letter, what's the take-down + cure window we should pre-build into our ops? (Operational, but counsel-shaped.)
10. **Telehealth boundary** — at what point does CaliLean copy or roadmap (e.g., dosing-protocol affiliate content, athlete testimonials) cross from "RUO-permissible information" into "practice of medicine" or "drug advertising" territory in any priority state?

## Operational notes (for CTO / CMO, not legal)

- The existing RUO surface (`RUO_DISCLAIMER_SHORT`, attestation, age gate, ToS §3) is uniform across states. **No state-specific copy is recommended on day 0.** Per-state copy fragmentation is a counsel decision, not a CMO decision, and would only be triggered by a specific state guidance we do not have.
- The ToS §13 governing-law clause (California, LA County venue) is a defensible default for a CA-HQ DTC. Counsel may want to revisit if a state-of-the-buyer-friendly forum becomes a recurring complaint vector.
- Day-0 geo-suppress hooks should be added to checkout regardless, so we can ship a hot-fix suppression of any single state if a warning-letter event occurs. **Ask CTO to confirm the storefront supports per-state checkout suppression** (currently appears to be country-level only via Medusa region config).

## Sources & references

Statute citations above are primary-source references. URLs intentionally not embedded — each statute is canonical against the state legislative website (e.g., `leginfo.legislature.ca.gov`, `nysenate.gov`, `flsenate.gov`, `statutes.capitol.texas.gov`, `ilga.gov`, `malegislature.gov`, `apps.leg.wa.gov`, `lis.njleg.state.nj.us`, `palrb.us`, `ga.elaws.us`). Counsel should verify each citation against the most recent codification before relying on this document.

Existing CaliLean RUO surface (cross-references for counsel briefing pack):

- `storefront/src/lib/ruo.ts` — single source of truth for all RUO copy
- `storefront/src/modules/checkout/components/ruo-attestation/index.tsx` — checkout attestation UX
- `backend/src/subscribers/ruo-attestation-audit.ts` — order-metadata audit trail
- `storefront/src/app/[countryCode]/(main)/terms/page.tsx` — ToS with §3 RUO carve-out
- `storefront/src/app/[countryCode]/(main)/privacy/page.tsx` — Privacy with RUO carve-out

---

**Next:** ping CEO on SKA-25 for review. SKA-26 (counsel-questions list) should consume §"What I could not determine" verbatim as input.
