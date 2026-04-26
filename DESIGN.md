# CaliLean — Design Tokens (v0)

Source of truth for design tokens that downstream code (storefront Tailwind, packaging templates, email) compiles against. Locked by CMO + Designer 2026-04-26 against [identity-brief.md](docs/brand/identity-brief.md) v1.

> Final palette/type token names land in [SKA-9](/SKA/issues/SKA-9) Designer brief. This file holds the v0 set the storefront swap ([SKA-4](/SKA/issues/SKA-4)) and brand surfaces compile against today.

## Wordmark

| Token | Value | Notes |
|---|---|---|
| `--brand-wordmark-primary` | `url('/brand/wordmark.svg')` | Master, mono-color via `currentColor`. |
| `--brand-wordmark-favicon` | `url('/brand/favicon-c.svg')` | Single-letter `c` lockup. Monogram deferred to v2. |
| `--brand-wordmark-pinned-tab` | `url('/brand/safari-pinned-tab-mask.svg')` | Apple tints via accent. |
| `--brand-wordmark-tracking-nav` | `0.012em` | Effective +12 at 24px nav. |
| `--brand-wordmark-tracking-display` | `0.030em` | +30 master, used at 48–96px. |
| `--brand-wordmark-tracking-packaging` | `0.040em` | +40 at 200pt+ for print/packaging. |
| `--brand-wordmark-min-width-nav` | `88px` | Below this, drop to favicon `c`. |
| `--brand-wordmark-min-width-body` | `64px` | Acceptable in body/footer. |
| `--brand-wordmark-clear-space` | `1.0em` | ≥ height of lowercase `l` on all sides. |

## Color — Palette A (Salt & Iron)

Locked palette per identity-brief §7. One accent per layout. 70% of any layout is Ground or Ink.

| Token | Hex | Role |
|---|---|---|
| `--brand-color-salt` | `#F4F2EC` | Ground (page background, packaging substrate). |
| `--brand-color-iron` | `#1F2326` | Ink (body type, wordmark). |
| `--brand-color-pacific` | `#3A5A6A` | Accent (CTAs, links, COA chips). |
| `--brand-color-eucalyptus` | `#7C8A78` | Accent (section markers, badges — sparingly). |
| `--brand-color-coral` | `#D9624A` | Signal (warning/Rx callouts only — never decorative). |

### Aliases

| Alias | Resolves to | Use |
|---|---|---|
| `--bg-default` | `--brand-color-salt` | Page background. |
| `--text-default` | `--brand-color-iron` | Body copy + wordmark. |
| `--text-on-dark` | `#FFFFFF` | Wordmark on dark surfaces, ≥ 4.5:1 contrast required. |
| `--accent-cta` | `--brand-color-pacific` | Primary buttons, links. |
| `--accent-section` | `--brand-color-eucalyptus` | Tag chips, section dividers. |
| `--signal-warning` | `--brand-color-coral` | Lab/disclaimer callouts. |

### Color rules

- ❌ Never gradients on primary surfaces.
- ❌ Never two-tone the wordmark.
- ❌ Never stack accents in a single layout.
- ❌ Wordmark on photography requires a Salt scrim plate behind the mark — no drop shadows, no outline strokes.

## Type — Pairing 1 (Editorial + Precision)

Locked per identity-brief §7. Three-tier hierarchy: serif display, sans body, mono technical. **No Switzer. Anywhere.**

| Token | Stack | Notes |
|---|---|---|
| `--font-display` | `'GT Sectra Display', 'Fraunces', 'Domaine Display', 'Times New Roman', serif` | Headlines, 32px+ only. License GT Sectra; Fraunces (OFL) is the open-source fallback Designer ships with the wordmark. |
| `--font-body` | `'Söhne', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | All body, nav, COA tables, forms. Inter is licensed-fallback if Söhne is not yet procured. |
| `--font-mono` | `'Söhne Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` | Lot numbers, dosages, COA values, code. Trust signal — always render dosages and lot numbers in mono. |

### Type rules

- ❌ Body in serif. Headlines serif, body sans, technical mono — three tiers, no exceptions.
- ❌ Display weights below 32px.
- ❌ Wordmark bold or italic — single weight (Regular, 400) only.
- ✅ Body line-height 1.5–1.65.
- ✅ Numbers in body copy use `font-feature-settings: 'tnum'` (tabular figures).
- ✅ Dosages and lot numbers always in `--font-mono`.

### Font procurement

| Family | Status | License path |
|---|---|---|
| GT Sectra Display | Pending procurement (Grilli Type, web license + 1× desktop) | CEO-owned spend — flag at next budget review. |
| Söhne | Pending procurement (Klim, web + desktop) | Same. |
| Fraunces | ✅ In use today via Google Fonts (SIL OFL, free for commercial). |
| Inter | ✅ Free fallback (SIL OFL). |
| JetBrains Mono | ✅ Free fallback (SIL OFL). |

Until GT Sectra and Söhne are procured, the storefront ships Fraunces + Inter + JetBrains Mono — visually 90%+ of the locked stack and zero license risk.

## Tagline

Master tagline: **"Peptides, made plain."** Never set in the master wordmark lockup — lives elsewhere on the page (hero, footer, OG cards). Render in `--font-display` at hero scale, `--font-body` in chrome.

## Storefront integration target

CTO swaps these surfaces in [SKA-4](/SKA/issues/SKA-4):

- `storefront/src/modules/bluum/icons/bluum-logo.tsx` → import from `docs/brand/logo/master/wordmark.svg`
- `storefront/public/favicon.ico` → regenerate from `docs/brand/logo/master/favicon-c.svg`
- `storefront/public/safari-pinned-tab.svg` → copy from `docs/brand/logo/master/safari-pinned-tab-mask.svg`
- `storefront/tailwind.config.js` `fontFamily.sans` → swap `Switzer` for the Pairing 1 stacks above
- `storefront/tailwind.config.js` `colors.bluum` → rename to `colors.calilean` and replace with Palette A values

## Don'ts (rolled up)

- ❌ Rotate, italicize, embolden the wordmark.
- ❌ Pair the wordmark with a tagline lockup.
- ❌ Pair the wordmark with leaf/droplet/helix/hexagon/shield/syringe/medical-cross/peptide-molecule iconography.
- ❌ Stylize "Cali" differently from "Lean."
- ❌ Add ™/® inside the lockup at display size — reserve for legal footers.
- ❌ Anything Switzer.

For the full identity contract (positioning, voice, tagline, photography), see [docs/brand/identity-brief.md](docs/brand/identity-brief.md).
