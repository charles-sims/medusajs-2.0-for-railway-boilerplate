# DESIGN.md — CaliLean Design Tokens (v1)

> Version: v1 · Date: 2026-04-27 · Owner: Designer + CTO
> Source of truth for tokens consumed by `storefront/tailwind.config.js` + `storefront/src/styles/calilean-tokens.css`.
> Companion: `docs/brand/identity-brief.md` (locked v1.1 RUO) and `docs/brand/wordmark-brief.md`.

---

## 1. Palette — v2 — White + Carolina Blue + Black

| Token | Hex | Tailwind | CSS var | Role |
|---|---|---|---|---|
| white | `#FFFFFF` | `calilean.bg` | `--cl-bg` | Page background. Clean white. |
| ink | `#111111` | `calilean.ink` | `--cl-ink` | Body text, wordmark. Near-black. |
| pacific | `#7090AB` | `calilean.pacific` | `--cl-pacific` | Primary accent (Carolina Blue). CTAs, links. |
| fog | `#9CA3A8` | `calilean.fog` | `--cl-fog` | Muted text, dividers. |
| sand | `#F0F0F0` | `calilean.sand` | `--cl-sand` | Surface variant. Cards. Light grey. |
| coa | `#111111` | `calilean.coa` | `--cl-coa` | Lab black. COA / batch / data UI. |
| alert | `#A23B2A` | `calilean.alert` | `--cl-alert` | RUO disclaimer accent. Restraint. |

Aliases (legacy semantic compat for existing storefront classes):

- `eucalyptus` → alias for `pacific` (do not introduce a new green; deferred to Palette C).
- `coral` → alias for `alert`.

## 2. Type — Plus Jakarta Sans + JetBrains Mono

| Role | Family | next/font key |
|---|---|---|
| Display | **Plus Jakarta Sans 700** (SIL OFL, variable) | `Plus_Jakarta_Sans` |
| Body / sans | **Plus Jakarta Sans 400/500/600** (SIL OFL, variable) | `Plus_Jakarta_Sans` |
| Mono / data | **JetBrains Mono** (Apache 2.0, variable) | `JetBrains_Mono` |

Loading: `next/font/google` with `display: 'swap'`. CSS variables: `--font-display`, `--font-sans`, `--font-mono`. Tailwind families read these vars.

**Forbidden:** Switzer (legacy Bluum). Fraunces (v1 serif, retired). Avenir/Proxima/Gotham. Circular/Visby. Any humanist-rounded sans.

## 3. Logo masters

PNG-based wordmark assets under `storefront/public/brand/logo/`:

- Primary wordmark PNG with wave/infinity motif
- Inverse variant for dark backgrounds
- CL monogram favicon

## 4. Surfaces — minimum sizes

| Surface | Min wordmark height | Falls back to |
|---|---|---|
| Nav (desktop) | 28px | — |
| Nav (mobile) | 24px | — |
| Footer | 28px | — |
| Email header | 32px | — |
| OG card | 96px | — |
| < 16px | — | CL monogram favicon only |

## 5. Open items

1. Designer to ratify PNG wordmark exports and favicon set after workspace syncs.
2. CL monogram favicon finalization.

---

## Changelog

- **v1 (2026-04-27)** — v2 rebrand: replaced Salt & Iron palette with White + Carolina Blue + Black. Replaced Fraunces + Inter typography with Plus Jakarta Sans. Wordmark is now PNG-based from `storefront/public/brand/logo/`. Removed wordmark tracking section (CSS custom properties retired). Removed "no pure white" rule and warm surface ladder. Added Fraunces to forbidden fonts list.
- **v0 (2026-04-26)** — Initial DESIGN.md committed by CTO during [SKA-17](/SKA/issues/SKA-17). Built from Designer's published spec on [SKA-13](/SKA/issues/SKA-13) because Designer's master commits had not synced into the CTO workspace at swap time. Designer to overwrite or annotate as needed.
