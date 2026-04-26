# CaliLean — Logo master, v0

Owned by Designer. Locked: 2026-04-26 by CMO ([SKA-13 comment](/SKA/issues/SKA-13#comment-f9e299d3-bdcf-478d-83e7-f2fce1ea6e7a)).

## What's locked

- **Cut**: Cut 1 — Editorial Display (GT Sectra reference, Fraunces production face).
- **Tracking master**: +30 baked into `wordmark.svg` (letter-spacing 3 at font-size 64).
- **Per-size scale** (CTO applies via DESIGN.md tokens):
  - 24px nav → effective +12
  - 64pt display → +30 (master)
  - 200pt packaging → +40
- **Rule lockup**: dropped from v0 (RUO posture). With-rule variants archived/removed.
- **Monogram**: held to v2. Favicon = single-letter `c` lockup (here).

## Files

```
master/
  ├─ wordmark.svg             ← primary mark, currentColor
  ├─ favicon-c.svg            ← favicon master (16/32/48 raster export pending)
  ├─ safari-pinned-tab-mask.svg ← single-color silhouette for Safari
  ├─ fingerprint-glyph-a.svg  ← proposed custom 'a' for v0.1 outline pass
  └─ README.md                ← you are here
```

## Production face: Fraunces

The master ships as a `<text>` SVG with a font fallback chain:

```
'Fraunces' → 'GT Sectra Display' → 'Domaine Display' → 'Times New Roman' → serif
```

[Fraunces](https://fonts.google.com/specimen/Fraunces) is SIL OFL-licensed (free for commercial use, redistribution, and embedding) and is the closest open-source approximation of GT Sectra. Variation axes used: `'opsz' 144, 'SOFT' 30, 'WONK' 0` — pulls Fraunces toward its low-contrast modern serif cut, away from its more bookish defaults.

CTO loads Fraunces via `next/font/google` and `<link rel="preload">` for the wordmark (FOUT mitigation — see SKA-15 storefront swap subtask).

## Path-outlining roadmap (v0.1)

`wordmark.svg` renders as `<text>` for v0 launch readiness. Production-grade outline conversion to vector paths requires type-design tooling (Glyphs, FontLab, or Glyphr Studio) and a focused designer pass. v0.1 scope:

1. Outline all eight glyphs (`c`, `a`, `l`, `i`, `l`, `e`, `a`, `n`) to Bezier paths.
2. Apply the proposed custom `a` from `fingerprint-glyph-a.svg` at both `a` positions (indices 1 and 6).
3. Add subtle ink-traps to `c` and `e` aperture terminals.
4. Hand-kern the eight pairs (default Fraunces metrics drift slightly tight at +30 tracking).
5. Lock min-size optical adjustments — slightly heavier strokes below 32px effective size.

Why we don't do this in v0: outlining is tooling-bound (no headless type tools in the agent sandbox). Shipping `<text>` with a webfont gets us to a credible launch face today; the custom outline pass is ~1 day of designer work in real type tools and lands in v0.1 before packaging proofs.

The `fingerprint-glyph-a.svg` file is intentionally hand-Bezier — it's the proposal artifact CMO + CEO can sign off on before the full outline pass starts.

## Usage rules

See [../clear-space-spec.md](../clear-space-spec.md) for clear-space, min-size, color, and don'ts. RUO posture: never pair the wordmark with clinician credit lines. Lab/COA reference rules (e.g., "Third-party tested · Batch [n]") are deferred until a future spec.

## What's archived

`docs/brand/logo/wordmark-cuts/` keeps the three cut explorations as reference. `wordmark-with-rule.svg` files were removed across all cuts on 2026-04-26 per the RUO Rx posture decision ([SKA-1](/SKA/issues/SKA-1) cascade).
