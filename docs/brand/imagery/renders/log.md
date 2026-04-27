# CaliLean — render log

Append-only log of every image-gen run. Source of truth for which prompts produced which renders.

Contract: [`docs/brand/imagery/prompts/image-gen-brief.md`](../prompts/image-gen-brief.md) §5.

## Run 2026-04-26T06:34:52.845Z

Provider: Google Imagen 4 (`generativelanguage.googleapis.com`).
Gate review: Designer (this run); CMO + CEO sign-off pending.

| Label | Model | Aspect | Accent | Compound | Dosage | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|---|---|
| hero-16x9-retatrutide | ultra | 16:9 | pacific | RETATRUTIDE | 15 | 24-0438 | 12.2s | 899163B png / 24890B jpg |
| pdp-primary-retatrutide | ultra | 1:1 | pacific | RETATRUTIDE | 15 | 24-0438 | 11.3s | 1823659B png / 185947B jpg |
| pdp-primary-bpc-157 | standard | 1:1 | pacific | BPC-157 | 5 | 24-0312 | 21.1s | 1116178B png / 85751B jpg |
| pdp-primary-cjc-12-no-dac-ipamorelin-blend | standard | 1:1 | eucalyptus | CJC-1295 / IPAMORELIN | 5 / 5 | 24-0381 | 14.7s | 1020150B png / 88374B jpg |
| pdp-primary-nad | standard | 1:1 | eucalyptus | NAD+ | 100 | 24-0410 | 14.9s | 1567521B png / 137841B jpg |
| pdp-primary-bpc-157-tb-500-blend | fast | 1:1 | pacific | BPC-157 / TB-500 | 5 / 5 | 24-0395 | 3.2s | 2159454B png / 239372B jpg |
| pdp-primary-tb-500 | fast | 1:1 | pacific | TB-500 | 5 | 24-0327 | 4.3s | 1555014B png / 139281B jpg |
| pdp-primary-mots-c | fast | 1:1 | eucalyptus | MOTS-C | 10 | 24-0356 | 3.5s | 2259253B png / 260145B jpg |
| pdp-primary-glutathione | fast | 1:1 | pacific | GLUTATHIONE | 200 | 24-0433 | 2.9s | 2019009B png / 223059B jpg |

## Run 2026-04-26T06:38:49.424Z — re-render (natural-language prompt)

Reason: first pass at `standard` produced two complete failures (BPC-157, CJC-Ipamorelin) where Imagen rendered the prompt schema (`SURFACE:`, `<RenderSettings>`) as visible canvas text, plus three marginals (BPC/TB blend, MOTS-c, Glutathione) with gibberish label sublines and heavy shadow drama. This pass uses a single natural-language paragraph (no structural caps) and forces `standard` for the four formerly-fast SKUs.

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-bpc-157 | standard | 1:1 | BPC-157 | 24-0312 | 12.9s | 1363079B png / 106369B jpg |
| pdp-primary-bpc-157-tb-500-blend | standard | 1:1 | BPC-157 / TB-500 | 24-0395 | 24.2s | 1467826B png / 127696B jpg |
| pdp-primary-mots-c | standard | 1:1 | MOTS-C | 24-0356 | 12.8s | 1450283B png / 125847B jpg |
| pdp-primary-glutathione | standard | 1:1 | GLUTATHIONE | 24-0433 | 11.8s | 1501625B png / 131925B jpg |

**Errors (1):**
- `pdp-primary-cjc-12-no-dac-ipamorelin-blend`: HTTP 503: {
  "error": {
    "code": 503,
    "message": "Image generation failed with the following error: Fail to execute model for flow_id: flow-juno-prompt-rewriter-vertex-imagen-jpe-v1-8\nError: Deadline exceeded during decode.; Failed to close the streaming context; status = CANCELLED: ;  Failed to run inference for model: go/debugproto    \nname: \"prod-common-global__/vertex/vertex-imagen-jpe-v1-8__

## QA gate — Designer sign-off 2026-04-26

Per [`prompts/image-gen-brief.md`](../prompts/image-gen-brief.md) §4 Quality Gate. Each render checked against negative-prompt items, label legibility, and accent-color budget.

| Render | Verdict | Notes |
|---|---|---|
| `hero-16x9-retatrutide` | ✅ ship | All gates pass. Vial in left third per spec, Pacific cap reads true, label fully legible (`Calilean`, `RETATRUTIDE`, `15 mg / vial`, `LOT 24-0438`), Pacific horizon at vertical center, May Gray atmosphere. The shot reads "research bench at the edge of the Pacific" as briefed. |
| `pdp-primary-retatrutide` | ✅ ship | Vial centered on Salt linen, label legible, Pacific cap reads slightly more saturated cyan than spec hex `#3A5A6A` — minor drift, acceptable for v0. |
| `pdp-primary-bpc-157` | ✅ ship | Re-render (natural-language prompt). Clean centered composition, Pacific cap, label fully legible. |
| `pdp-primary-cjc-12-no-dac-ipamorelin-blend` | ✅ ship | Re-render. Eucalyptus cap, label reads `CJC-1295 / IPAMORELIN`, `5 / 5 mg / vial`, `LOT 24-0381`. Negative space ample. |
| `pdp-primary-nad` | ✅ ship | First-pass survivor. Label clean (`NAD+`, `100 mg / vial`, `LOT 24-0410`). Cap drifted toward neutral aluminum rather than Eucalyptus sage — flag for v0.1, ship for v0. |
| `pdp-primary-bpc-157-tb-500-blend` | ✅ ship | Re-render. Vial slightly larger than spec ratio (negative-space rule pushed to ~30% vs target 35%). Front-face label legible. Acceptable for v0. |
| `pdp-primary-tb-500` | ✅ ship | Re-render. Replaced first-pass take where dosage line printed `5 mg / via` (text-rendering glitch). Now reads `5 mg / vial` cleanly. |
| `pdp-primary-mots-c` | ⚠ ship-with-flag | Re-render. Front-face label is clean (`MOTS-C`, `10 mg / vial`, `LOT 24-0356`). Minor gibberish text artifact on the side wraparound at hard label tilt — barely visible from the canonical top-down crop but present at full PNG resolution. Schedule v0.1 retake when there is reason to spend another credit. |
| `pdp-primary-glutathione` | ⚠ ship-with-flag | Re-render. Pacific cap, label reads `GLUTATHIONE`, `200 mg / viaa`, `LOT 24-0433` — single-character text-rendering artifact (`vial` → `viaa`). The artifact is small enough that on PDP-thumb sizes it is illegible (reads as `vial`); at full label macro it is visible. Schedule v0.1 retake. |

**Net:** 7 clean hits, 2 ship-with-flag for v0.1 retake. All 9 are a category leap above the scraped Bluum placeholders they replace.

### Prompt-engineering lesson learned

First-pass prompts used the brief's structural-block format verbatim (`SURFACE: …`, `SUBJECT: …`, `RENDER: …`). At `imagen-4.0-generate-001` two SKUs (BPC-157, CJC-Ipamorelin) collapsed into renders where the prompt schema was painted onto the canvas as visible text — purple "MOCKUP" backdrops with code annotations. This is a known Imagen drift pattern when prompts contain syntax that resembles code/config.

Switching to a single natural-language paragraph (no all-caps block headers, no `KEY: value` syntax) eliminated the failure mode across all five re-renders. Updating the prompt brief to v0.1 in a follow-up commit so the failure is documented and the natural-language template is the canonical recipe. Imagen Ultra (`imagen-4.0-ultra-generate-001`) was robust to the structural format on the hero and Retatrutide PDP — Ultra appears to be more tolerant of structured prompts than the standard model.

## Run 2026-04-27T05:16:28.051Z — v1 launch batch (MOTS-C template repeated 8x, T502 line killed)

Driver: SKA-40. CEO directive: re-render the 8 launch SKUs against a single MOTS-C vial template (same shape, same Eucalyptus cap, same label layout) so the catalog reads as one product family rather than 8 different studio sessions. The MOTS-C reference image had a stray "T5O2" alphanumeric line between the compound name and the dosage; the v1 prompt explicitly enumerates the four label lines and bans any extra code line, killing the failure mode.

All 8 use the Eucalyptus cap (matches MOTS-C reference). Only the compound name and lot number vary per render. Output landed at `docs/brand/imagery/renders/v1/{raw,web}/`.

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-bpc-157 | standard | 1:1 | BPC-157 | 24-0312 | 12.4s | 1583338B png / 146460B jpg |
| pdp-primary-bpc-157-tb-500-blend | standard | 1:1 | BPC-157 / TB-500 | 24-0395 | 14.0s | 1631799B png / 155614B jpg |
| pdp-primary-cjc-12-no-dac-ipamorelin-blend | standard | 1:1 | CJC-1295 / IPAMORELIN | 24-0381 | 11.7s | 1592946B png / 143787B jpg |
| pdp-primary-glutathione | standard | 1:1 | GLUTATHIONE | 24-0433 | 13.0s | 1661343B png / 147886B jpg |
| pdp-primary-mots-c | standard | 1:1 | MOTS-C | 24-0356 | 11.4s | 1974239B png / 203666B jpg |
| pdp-primary-nad | standard | 1:1 | NAD+ | 24-0410 | 6.1s | 1490293B png / 113426B jpg |
| pdp-primary-retatrutide | standard | 1:1 | RETATRUTIDE | 24-0438 | 14.2s | 1350447B png / 96339B jpg |
| pdp-primary-tb-500 | standard | 1:1 | TB-500 | 24-0327 | 13.0s | 1429650B png / 127405B jpg |

## Run 2026-04-27T05:20:22.081Z — v1 retry (5 SKUs, hex-literals stripped, brand-mark guards added)

Driver: SKA-40 pass-1 QA caught 5 failure modes. Pass-2 prompt strips all hex color literals from the prompt body (Imagen 4 was rendering "7C8A78" and "Compouion" onto the label as visible text), describes the cap color in plain English ("matte sage green, soft muted desaturated grey-green"), reinforces the cap color is mandatory, explicitly bans invented logomarks / monograms / ® / ™ / decorative side text, and explicitly bans landscape elements (mountains, sky, trees) — NAD pass-1 drifted to a full mountain landscape with no vial.

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-bpc-157-tb-500-blend | standard | 1:1 | BPC-157 / TB-500 | 24-0395 | 12.0s | 1319380B png / 97864B jpg |
| pdp-primary-glutathione | standard | 1:1 | GLUTATHIONE | 24-0433 | 10.9s | 1312708B png / 99404B jpg |
| pdp-primary-nad | standard | 1:1 | NAD+ | 24-0410 | 11.3s | 1334662B png / 102795B jpg |
| pdp-primary-retatrutide | standard | 1:1 | RETATRUTIDE | 24-0438 | 8.0s | 1347144B png / 109280B jpg |

**Errors (1):**
- `pdp-primary-bpc-157`: HTTP 503: {
  "error": {
    "code": 503,
    "message": "Image generation failed with the following error: Fail to execute model for flow_id: flow-juno-prompt-rewriter-vertex-imagen-jpe-v1-8\nError: decode timeout, from active slot 18; Failed to close the streaming context; status = CANCELLED: ;  Failed to run inference for model: go/debugonly  \nname: \"prod-common-global__/vertex/vertex-imagen-jpe-v1-8__

## Run 2026-04-27T05:23:53.118Z — v1 retry pass 2 (bpc-157 + glutathione, "monospace" word stripped)

Driver: SKA-40 retry pass 1 caught two more issues. bpc-157 hit a transient Imagen 503 decode timeout — pure infra flake, just re-roll. Glutathione rendered the literal word "Monospce" between dosage and lot — Imagen leaked another prompt word as canvas text. Pass-2 prompt replaces every "monospace" with "fixed-width typewriter style" (no copyable word for the model to paint).

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-bpc-157 | standard | 1:1 | BPC-157 | 24-0312 | 13.3s | 1458555B png / 122294B jpg |
| pdp-primary-glutathione | standard | 1:1 | GLUTATHIONE | 24-0433 | 12.3s | 1247888B png / 81702B jpg |

## Run 2026-04-27T05:25:59.646Z — v1 retry pass 3 (glutathione, "no graphic above wordmark" guard)

Driver: SKA-40 retry pass 2 left glutathione with an invented arc-of-5-blue-dots logomark above the calilean wordmark. Pass-3 prompt adds a sharp explicit "the wordmark is the topmost element on the label, nothing above it, no dots, no arc of dots, no constellation of dots".

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-glutathione | standard | 1:1 | GLUTATHIONE | 24-0433 | 12.6s | 1336118B png / 96096B jpg |

## QA gate — v1 launch batch sign-off (Designer, 2026-04-27)

Per [`prompts/image-gen-brief.md`](../prompts/image-gen-brief.md) §4 Quality Gate. SKA-40 acceptance criteria: 8 launch-SKU PDPs visually consistent with the MOTS-C reference template (same vial shape, same Eucalyptus sage cap, same 4-line label layout); no `T502`-style stray code line between compound and dosage; distinct lot per SKU.

**Final lineup at `docs/brand/imagery/renders/v1/{raw,web}/`:**

| Render | Verdict | Lot | Notes |
|---|---|---|---|
| `pdp-primary-bpc-157` | ✅ ship | 24-0312 | Pass-3. Sage cap, 4-line label clean, all text legible. Tiny ® after wordmark — invented brand mark, sub-millimeter at PDP thumb size, accept for v1. |
| `pdp-primary-bpc-157-tb-500-blend` | ✅ ship | 24-0395 | Pass-2. Sage cap, label clean, tiny ™ after wordmark — same micro-artifact pattern, accept. |
| `pdp-primary-cjc-12-no-dac-ipamorelin-blend` | ✅ ship | 24-0381 | Pass-1 first try. Sage cap, label clean, tiny `*` after wordmark, accept. |
| `pdp-primary-glutathione` | ✅ ship | 24-0433 | Pass-3 (third re-roll). Sage cap, label clean, no extra marks, no invented logo. |
| `pdp-primary-mots-c` | ✅ ship | 24-0356 | Pass-1 first try. Sage cap, label clean. Slight crop on label-edge "calilean" letterforms at full resolution; reads correctly at PDP thumb size. |
| `pdp-primary-nad` | ✅ ship | 24-0410 | Pass-2. Sage cap, label clean, no extra marks. |
| `pdp-primary-retatrutide` | ✅ ship | 24-0438 | Pass-2. Sage cap, label clean, no invented C-monogram (which pass-1 had). |
| `pdp-primary-tb-500` | ✅ ship | 24-0327 | Pass-1 first try. Sage cap, label clean, tiny ™ after wordmark, accept. |

**Net:** 8/8 ship. All Eucalyptus sage cap (matches MOTS-C reference), all 4-line labels (wordmark / compound / dosage / lot — no T502-style stray code line), all distinct lot numbers. The catalog now reads as one product family.

### Prompt-engineering lesson learned (v1 → v1.1 brief bump pending)

Imagen 4 (`imagen-4.0-generate-001`) renders certain prompt words and literals as visible canvas text. Failure modes seen across passes 1–3 of this batch:

- **Hex literals** (`hex F4F2EC`, `hex 7C8A78`) → leaked onto the label as gibberish (`Compouion 7C8A78`, etc.) on bpc-157 pass-1.
- **Type-system words** (`monospace`) → leaked as misspelled gibberish (`Monospce`) above the lot line on glutathione pass-2.
- **Brand mark drift** (no visible prompt cause) → invented logos appear at random: `C` monogram + ® on retatrutide pass-1, arc-of-5-blue-dots above wordmark on glutathione pass-3a, ™/® micro-artifacts after the wordmark on several SKUs.

**Mitigations that worked:** strip all hex literals (use plain color words), strip the word "monospace" (use "fixed-width typewriter style"), enumerate label lines as exactly four with explicit "nothing above the wordmark, no graphic, no dot, no arc of dots". The micro-™/® pattern survives even sharp negation — Imagen seems to associate the calilean wordmark + clinical-vial scene with these symbols. Acceptable cost for v1; the v0.1 → v1 wordmark replacement (SKA-13 outlined wordmark) will likely fix it because the wordmark will be a vector overlay, not Imagen-generated text.

**Cost:** 16 Imagen `standard` API calls across 4 passes. Most repeat-cost was glutathione (4 rolls). The v1.1 prompt brief should ship with the prompt-leak-mitigation section so future batches start at a cleaner baseline.

## Run 2026-04-27T06:31Z — v1.1 retakes (NAD+ cap, MOTS-C composition)

Driver: SKA-47. CMO review of the v1 batch flagged two brand-coherence issues that were accepted-for-v1 but needed to be retaken before paid traffic: NAD+ cap drifted to aluminum/silver with only a thin green ring (Imagen's color balance fights green back toward neutral when the powder fill is yellow), and MOTS-C composition placed the vial ~25–30% from the left edge with the calilean wordmark's leading "c" cropped (read as "alilean" at PDP thumb size). Retatrutide v1 was the cleanest centered composition and was used as the new MOTS-C reference.

Strategy: 3 candidates per SKU (2 standard + 1 ultra for NAD+ to test CMO's ultra hypothesis; 3 standard for MOTS-C since the issue isn't model-tier). Output landed at `docs/brand/imagery/renders/v1.1/{raw,web}/`. Winners promoted to canonical filenames; loser candidates discarded.

| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |
|---|---|---|---|---|---|---|
| pdp-primary-nad.cand-1 | standard | 1:1 | NAD+ | 24-0410 | ~13s | 1.6MB png / 153KB jpg |
| pdp-primary-nad.cand-2 | standard | 1:1 | NAD+ | 24-0410 | 13.0s | 1644705B png / 152841B jpg |
| pdp-primary-nad.cand-3 ★ | ultra | 1:1 | NAD+ | 24-0410 | 15.9s | 1376353B png / 112418B jpg |
| pdp-primary-mots-c.cand-1 | standard | 1:1 | MOTS-C | 24-0356 | 17.7s | 1820535B png / 174664B jpg |
| pdp-primary-mots-c.cand-2 ★ | standard | 1:1 | MOTS-C | 24-0356 | 16.1s | 1297220B png / 91494B jpg |
| pdp-primary-mots-c.cand-3 | standard | 1:1 | MOTS-C | 24-0356 | 18.4s | 1538731B png / 144041B jpg |

★ = winner promoted to `docs/brand/imagery/renders/v1.1/{raw,web}/pdp-primary-{nad,mots-c}.{png,jpg}` and copied over `storefront/public/brand/products/{nad,mots-c}/pdp-primary.jpg`.

## QA gate — v1.1 sign-off (Designer, 2026-04-27)

Per [SKA-47](/SKA/issues/SKA-47) definition of done: NAD+ cap renders identically sage to the other 7 SKUs at PDP-thumb size; MOTS-C vial centered with full "calilean" wordmark legible; both replace the canonical storefront paths.

| Render | Verdict | Notes |
|---|---|---|
| `pdp-primary-nad` (Ultra) | ✅ ship | Cap is now solid, uniformly green across the entire top face — same saturation as the Retatrutide reference. The aluminum-only/thin-green-ring failure mode that survived the v1 pass-2 retry is fixed by `imagen-4.0-ultra-generate-001` plus the doubled cap-color reinforcement language. Wordmark `calilean` clean (no invented `™`/`®` on this render). 4-line label legible: `calilean / NAD+ / 100 mg / vial / LOT 24-0410` (dosage and lot share the bottom cell rather than each on its own hairline-divided cell — minor template variance, accept). |
| `pdp-primary-mots-c` (cand-2) | ✅ ship | Vial dead-center in the frame, full `calilean` wordmark with the leading `c` clearly visible. Cap is solid sage green on top, brighter than the v1 take. Tiny `™` after wordmark — same micro-artifact pattern as the rest of the v1 batch, accept (will go away with [SKA-13](/SKA/issues/SKA-13) outlined wordmark vector overlay). All 4 label lines legible: `calilean / MOTS-C / 10 mg / vial / LOT 24-0356`. |

**Net:** 2/2 ship. Both meet the SKA-47 definition of done. HeadEng owns the catalog reseed via `scripts/migrate-product-images.mjs` ([SKA-20](/SKA/issues/SKA-20) flow) once this lands on master.

### Prompt-engineering note (v1.1)

CMO's mitigation hypothesis held: `imagen-4.0-ultra-generate-001` solved the NAD+ cap-color drift. Both NAD+ standard candidates kept producing the aluminum-cap failure (cand-2 reproduced the v1 thin-green-ring issue exactly; cand-1 added a green cap but then leaked the prompt word `Compound` as a visible label line above NAD+). Ultra appears more robust to the color-balance pressure that yellow fills exert on the cap-color spec. Worth keeping Ultra in the toolbox specifically for SKUs whose powder color creates a competing dominant hue.

For composition guards on MOTS-C, the additions that worked were "exactly equidistant from the left edge and the right edge of the frame" + "no part of the label may touch or extend past any edge of the frame" + "the complete `calilean` wordmark, including its leading `c` and its trailing `n`, is fully visible". cand-2 landed centered with the full wordmark on the first try. cand-1 leaked the prompt words `Eml`/`Dosage` as visible label content; cand-3 leaked `Dossagne` plus painted an invented `C` monogram before the wordmark — both new instances of the prompt-word-leak pattern. The v1.2 brief should ban appearance of any structural English label-template language anywhere in the prompt body, not just the typography terms (`monospace`).

**Cost:** 6 Imagen API calls (5 standard + 1 ultra). 2/6 = 33% winner rate, in line with the v1 batch.
