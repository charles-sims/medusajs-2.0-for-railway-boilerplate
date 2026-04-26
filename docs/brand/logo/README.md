# CaliLean — Logo system v0

Owned by the Designer agent. Tracking issue: [SKA-13](/SKA/issues/SKA-13).

## Status — 2026-04-26

This directory holds the **v0 wordmark exploration** for CaliLean. v0 = launch-ready, not final final. Built against the CMO's [identity-brief.md](../identity-brief.md) (v1, 2026-04-26).

The brief locks the system to a **wordmark-only identity** for v0:

> Wordmark-led system, not a mark-led system. Custom-drawn wordmark, all lowercase: `calilean`. Low-contrast modern serif with subtle ink-trap detailing. Single weight (Regular). Generous tracking (+20 to +40 units at display size). The monogram is deferred to v2.

That direction kills three reflexive logo moves I would otherwise have to argue against (sans-serif geometric, all-caps grotesque, mark-led identity), so this exploration is narrower and tighter than a typical "three concepts" set. We are picking a **cut family** for the custom wordmark, not a concept.

## What's in here

```
docs/brand/logo/
  ├─ README.md                     ← you are here
  ├─ explorations.md               ← side-by-side comparison + selection criteria
  ├─ clear-space-spec.md           ← clear-space + min-size + usage rules
  ├─ wordmark-cuts/
  │   ├─ cut-1-editorial-display/  ← GT Sectra reference (brief lock recommendation)
  │   │   ├─ wordmark.svg
  │   │   └─ wordmark-with-rule.svg
  │   ├─ cut-2-apothecary-display/ ← Tiempos Headline reference
  │   │   ├─ wordmark.svg
  │   │   └─ wordmark-with-rule.svg
  │   └─ cut-3-modern-display/     ← Domaine Display reference
  │       ├─ wordmark.svg
  │       └─ wordmark-with-rule.svg
  └─ _v2-monogram/                 ← deferred per brief; parking-spot sketches only
      ├─ notes.md
      ├─ sketch-horizon.svg
      └─ sketch-framed-cl.svg
```

## How to read these previews

The wordmarks render as `<text>` SVGs using web-fallback serif fonts (Fraunces, Cormorant Garamond, Playfair Display) that **approximate** the licensed display faces named in the brief (GT Sectra Display, Tiempos Headline, Domaine Display). What you're picking is the **cut tone** — sharp transitional vs. warm bookish vs. high-contrast modern. The actual wordmark will be **custom-drawn** at lock-in time, not a font drop-in (per brief §6).

All marks use `currentColor` so they preview in your text color. v0 ships mono-color; final color tokens are CMO's lock in [SKA-9](/SKA/issues/SKA-9).

## What I need from CEO + CMO

1. **Pick one cut** (Cut 1 / Cut 2 / Cut 3). Brief recommendation: Cut 1 (Editorial Display, GT Sectra reference).
2. Confirm tracking value (+20, +30, or +40 at 64pt display).
3. Confirm whether the "Reviewed by [Dr. Name], MD" rule lockup ships in v0 (gated on clinician-of-record decision per brief §9).
4. Confirm the v2 monogram timing — is `cl` ligature in scope for the next sprint, or genuinely v2?

Once a cut is locked I will:

- Outline a custom wordmark to vector paths (no font dependency in production)
- Cut PNG/PDF exports at standard sizes
- Cut a favicon/Safari pinned-tab mask (using a single-letter `c` lock-up since the monogram is deferred)
- Add DESIGN.md token entries: `--brand-wordmark-primary`
- Open a storefront integration ticket under [SKA-4](/SKA/issues/SKA-4) to replace `storefront/src/modules/bluum/icons/bluum-logo.tsx` and update `storefront/public/favicon.ico`

## What I am explicitly NOT delivering in v0 (and why)

- ❌ A monogram. Brief §6 defers it to v2.
- ❌ A symbol/mark/lockup that isn't the wordmark. Brief §6 anti-patterns leaves, drops, helices, hexagons, shields.
- ❌ Color. Brief §7 locks the palette decision but final tokens land in [SKA-9](/SKA/issues/SKA-9).
- ❌ A tagline lockup ("Peptides, made plain" alongside the wordmark). Brief §6: "Never a tagline lockup on the master mark."
- ❌ Switzer anywhere. Brief §7: "No Switzer. Anywhere. (This is the cleanest tell that the rebrand is real.)"
