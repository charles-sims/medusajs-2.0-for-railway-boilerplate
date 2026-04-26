# CaliLean Wordmark — Clear-space, sizing, and usage rules (v0)

Applies to the winning cut once selected. Aligned with [identity-brief.md](../identity-brief.md) §6.

## Clear space

- **Around the wordmark:** ≥ the height of the lowercase 'l' on all sides. The 'l' is the tallest character in the lowercase wordmark, so this gives a uniform measurable rule.
- **In the formal "Reviewed by Dr. [Name], MD" lockup:** the rule sits ½ x-height below the wordmark; the credit line sits a full x-height below the rule.

## Minimum sizes

| Surface | Wordmark min | Notes |
|---|---|---|
| Web nav | 88px wide | Below this, the cut's display details (inktraps, contrast) collapse. |
| Web body inline | 64px wide | Acceptable in body copy, footers. |
| Print body | 22mm wide | Same logic as web nav. |
| Print packaging | unrestricted | Display cuts gain presence at scale; +40 tracking at packaging size. |
| Embroidery | 30mm wide | Wordmark only. Switch to a heavier stand-in if embroidery thread can't hold ½-stroke detail. |
| Favicon | n/a | Use a single-letter `c` lockup, not the wordmark. (See note below — favicon spec lands at lock-in.) |

If you can't hit the minimum, drop to the favicon `c` lockup, never a shrunk wordmark.

## Color

v0 ships **mono-color** only (`currentColor` in SVG). Final color tokens are deferred to [SKA-9](/SKA/issues/SKA-9). Until then, valid usage:

- **Iron** (`#1F2326`) on **Salt** (`#F4F2EC`) — primary. Per identity-brief.md §7 palette A.
- White on dark surface (≥ 4.5:1 contrast).
- 100% K, 100% W, or solid foundry ink — no two-tones.
- **Never on photography without a scrim plate behind the mark.** No drop shadows, no blurs, no outline strokes.

## Don'ts

Pulled from [identity-brief.md](../identity-brief.md) §6 and §7:

- ❌ Don't rotate.
- ❌ Don't add drop shadows, glows, gradients, two-tones.
- ❌ Don't bold it. Wordmark is single-weight (Regular) — there is no bold variant.
- ❌ Don't italic it. Upright only.
- ❌ Don't pair with a tagline. "Peptides, made plain" lives elsewhere on the page, never inside the master mark.
- ❌ Don't pair with a leaf, droplet, helix, hexagon, shield, syringe, medical cross, caduceus, peptide molecule diagram, or anything that reads "biohack."
- ❌ Don't replicate Bluum's pastel/Switzer treatment from the existing storefront. **No Switzer. Anywhere.**
- ❌ Don't stylize "Cali" differently from "Lean." The mark is one word.
- ❌ Don't add "TM" / "®" inside the lockup at display size. Reserve for legal footers and packaging legal panels.

## File hygiene

- SVG masters live in `docs/brand/logo/wordmark-cuts/<cut>/`.
- Once a cut is locked, the chosen cut moves to `docs/brand/logo/master/` and the alternates stay archived under `wordmark-cuts/`.
- Exports (`png`, `ico`, `pdf`) get cut at lock-in time and placed under `storefront/public/brand/`.
- All SVGs include a `<title>` for accessibility.
- Wordmarks live as `<text>` during exploration; get outlined to vector paths at lock-in time so production has zero font dependency.
