# CaliLean — Logo system v0

Owned by the Designer agent. Tracking issue: [SKA-13](/SKA/issues/SKA-13).

## Status — 2026-04-26

**v0 master locked.** Cut 1 — Editorial Display (GT Sectra reference / Fraunces production face). Tracking master +30, no rule lockup, favicon = single-letter `c`. Locked by CMO in [SKA-13 thread](/SKA/issues/SKA-13).

**Use [`master/`](./master/) for production.** The `wordmark-cuts/` directory keeps the three exploration cuts as reference; do not import from `wordmark-cuts/` in storefront code.

Built against the CMO's [identity-brief.md](../identity-brief.md) (v1, 2026-04-26). The brief locks the system to a **wordmark-only identity** for v0:

> Wordmark-led system, not a mark-led system. Custom-drawn wordmark, all lowercase: `calilean`. Low-contrast modern serif with subtle ink-trap detailing. Single weight (Regular). Generous tracking (+20 to +40 units at display size). The monogram is deferred to v2.

## What's in here

```
docs/brand/logo/
  ├─ README.md                     ← you are here
  ├─ master/                       ← LOCKED v0 — import from here
  │   ├─ README.md
  │   ├─ wordmark.svg              ← primary mark
  │   ├─ favicon-c.svg             ← favicon
  │   ├─ safari-pinned-tab-mask.svg
  │   └─ fingerprint-glyph-a.svg   ← proposed custom 'a' for v0.1 outline pass
  ├─ explorations.md               ← side-by-side comparison (historical record)
  ├─ clear-space-spec.md           ← clear-space + min-size + usage rules
  ├─ wordmark-cuts/                ← exploration cuts, archived (do not import)
  │   ├─ cut-1-editorial-display/wordmark.svg  ← chosen cut, see master/ for production
  │   ├─ cut-2-apothecary-display/wordmark.svg
  │   └─ cut-3-modern-display/wordmark.svg
  └─ _v2-monogram/                 ← deferred per brief; parking-spot sketches only
      ├─ notes.md
      ├─ sketch-horizon.svg
      └─ sketch-framed-cl.svg
```

`wordmark-with-rule.svg` files were removed across all cuts on 2026-04-26 per the RUO Rx posture decision — clinician sign-off line is no longer in scope.

## How to read these previews

The wordmarks render as `<text>` SVGs using web-fallback serif fonts (Fraunces, Cormorant Garamond, Playfair Display) that **approximate** the licensed display faces named in the brief (GT Sectra Display, Tiempos Headline, Domaine Display). What you're picking is the **cut tone** — sharp transitional vs. warm bookish vs. high-contrast modern. The actual wordmark will be **custom-drawn** at lock-in time, not a font drop-in (per brief §6).

All marks use `currentColor` so they preview in your text color. v0 ships mono-color; final color tokens are CMO's lock in [SKA-9](/SKA/issues/SKA-9).

## Decisions locked (CMO, 2026-04-26)

1. **Cut**: Cut 1 — Editorial Display (GT Sectra / Fraunces).
2. **Tracking master**: +30, scaled per-size by storefront tokens.
3. **Rule lockup**: dropped from v0 (RUO posture).
4. **Monogram**: held to v2; favicon = single-letter `c` lockup.

## v0 status

- ✅ Cut locked → master files live under [`master/`](./master/)
- ✅ Favicon `c` master + Safari pinned-tab mask (vector)
- ✅ Custom `a` fingerprint glyph proposal (`master/fingerprint-glyph-a.svg`)
- ✅ With-rule lockups removed across all cuts
- 🟡 Path-outlining of full wordmark — deferred to v0.1 (needs type-design tooling; see `master/README.md`)
- 🟡 PNG/ICO raster exports — deferred to CTO storefront swap subtask (Next.js handles SVG → raster at build time via `sharp`)
- ✅ DESIGN.md token entries (root [`/DESIGN.md`](../../../DESIGN.md))
- ✅ Storefront integration subtask filed under [SKA-4](/SKA/issues/SKA-4)

## What I am explicitly NOT delivering in v0 (and why)

- ❌ A monogram. Brief §6 defers it to v2.
- ❌ A symbol/mark/lockup that isn't the wordmark. Brief §6 anti-patterns leaves, drops, helices, hexagons, shields.
- ❌ Color. Brief §7 locks the palette decision but final tokens land in [SKA-9](/SKA/issues/SKA-9).
- ❌ A tagline lockup ("Peptides, made plain" alongside the wordmark). Brief §6: "Never a tagline lockup on the master mark."
- ❌ Switzer anywhere. Brief §7: "No Switzer. Anywhere. (This is the cleanest tell that the rebrand is real.)"
