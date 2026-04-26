# CaliLean — Wordmark & Identity System Designer Brief (SKA-9)

> Author: CMO · Date: 2026-04-26 · Version: v1
> Audience: Designer ([SKA-13](/SKA/issues/SKA-13)). Coordinated with CTO ([SKA-4](/SKA/issues/SKA-4) brand-swap plan).
> Companion doc: `docs/brand/identity-brief.md` (overall brand brief, v1.1 RUO).
> **One page brief. Decisions are recommendations + alternates — pick the recommendation unless you have a written reason.**

---

## 1. Wordmark vs. lockup — RECOMMENDATION

**Ship a wordmark. No mark/icon on day one.**

- **Recommended:** custom-drawn lowercase **`calilean`** wordmark in a low-contrast modern serif. Single weight, single color, single piece of geometry to defend. Mono-color usable, embroidery-safe at 0.5", legible at 16px favicon.
- **Alternate 1 (for designer to explore):** wordmark + ascending dot-tittle on the `i`s as the only graphic flourish — a quiet "lab" cue (think pipette droplet without saying it).
- **Alternate 2 (hold for v1.5, do not ship in v0):** `cl` monogram in a circle for app icon, social avatar, packaging seal. Build it after the wordmark is set so it inherits the wordmark's drawing. **Do not lead with the monogram.**

**Lockups required (v0):**
1. Horizontal wordmark — primary, used everywhere.
2. Stacked wordmark + descriptor: `calilean` over the line `Research-grade peptides · South Bay`. Used for packaging back-of-pack and footer signature.
3. App icon mark: lowercase `c` in the wordmark drawing, on `--cl-coa` background. Built **after** wordmark final.

**Anti-pattern, do not ship:**
- A pill/capsule shape inside the logo.
- A peptide chain illustration. We are not a chemistry textbook.
- A wave or sun icon. Coastal is in the photography, not the mark.
- A medical cross or syringe. Ever. RUO posture means we explicitly avoid these.

---

## 2. Type system

| Role | Family (recommended) | Alternate | Notes |
|---|---|---|---|
| Display | **GT Sectra Display** | Editorial New, Domaine Display | Wordmark is hand-drawn from this reference, not the font itself. Web/email use Sectra. |
| Body | **Söhne** (Buch / Kräftig for emphasis) | Inter (cheaper fallback) | Quiet grotesque. All UI body, hero subhead, paragraph copy. |
| Mono / data | **Söhne Mono** | JetBrains Mono | Batch numbers, dosages, COA tables, technical specs. |

**Loading:**
- Self-host via `next/font` (CTO note from audit §3.3 — kill the Fontshare CDN dep).
- Display + Body subset to Latin-1 + numerals for first request.
- Mono can lazy-load on PDP only.

**Forbidden:** Switzer (current Bluum font), Avenir/Proxima/Gotham, Circular/Visby, anything humanist-rounded. We are an editorial brand, not a SaaS brand.

---

## 3. Color tokens — three palettes, one recommendation

### Palette A — Salt & Iron (RECOMMENDED, locked)

| Token | Hex | Role | Notes |
|---|---|---|---|
| `--cl-bg` | `#F4F2EC` | Page bg | Warm off-white. Not pure white. |
| `--cl-ink` | `#1F2326` | Body / wordmark | Near-black, blue undertone. AAA on `--cl-bg`. |
| `--cl-pacific` | `#3A5A6A` | Primary accent | Pacific at dawn. Use sparingly. CTAs, links. |
| `--cl-fog` | `#9CA3A8` | Muted text, dividers | AA on `--cl-bg` for body. |
| `--cl-sand` | `#E6E2D6` | Surface variant | Cards, elevated UI. |
| `--cl-coa` | `#0F1417` | Lab black | COA / batch / data UI. App icon bg. |
| `--cl-alert` | `#A23B2A` | RUO disclaimer accent | Used only in compliance moments. Restraint. |

### Palette B — Marine Lab (alternate, more institutional)

| Token | Hex | Notes |
|---|---|---|
| `--cl-pacific` swap | `#1B3A4B` | Deeper marine. More authority, less coastal. |

Use B if institutional sales (research labs, gyms with private programs) become a real channel.

### Palette C — Bone & Kelp (alternate, softer)

| Token | Hex | Notes |
|---|---|---|
| `--cl-pacific` swap | `#2F3A2C` | Deep kelp green. More naturalist. |

Use C in the Education Hub if we want the long-form content surface to read warmer than commerce.

**Designer deliverable:** ship `colors.json` (token → hex → semantic role) consumed by Tailwind config + a Notion/Stitch design source. Class rename in Tailwind `colors.bluum.*` → `colors.cl.*` is a CTO mechanical task.

---

## 4. Iconography style

- **Stroke icons only.** 1.5px, square caps, square joins. Geometric but not cute. Reference: **Phosphor (Light weight)** or **Lucide** with custom override on the few we draw ourselves.
- **No filled icons.** No two-tone. No gradient. No motion-blur cleverness.
- **Icons we'll need (v0):** truck (shipping), shield (compliance/age-gate), beaker (lab/COA), document (specs), search, account, cart.
- **Icons we will NOT use:** heart, star, sparkle, lightning bolt, syringe, pill, capsule, DNA helix, peptide chain, brain.

Icons are utilities. They never carry brand emotion. The wordmark and the photography do that.

---

## 5. Photography style

**One-line direction:** *Pre-dawn May Gray on the Strand. Real bodies, not models. Vials in still-life, never in hands.*

| Spec | Direction |
|---|---|
| Locations | The Strand (Manhattan/Hermosa/Redondo), El Porto stairs, RAT Beach trail, Veterans Park, Polliwog Park, El Segundo refinery skyline at golden hour. |
| Time of day | Blue hour + first hour of light. May Gray fog welcomed. No high noon. |
| Models | Real South Bay athletes, ages 35–55. Not professional fitness models. Visible skin texture, weathered training kit. We will source via gyms (Equinox MB, Supafit, El Segundo Athletic Club) — **photographer + Recruiter to coordinate**, not Designer. |
| Wardrobe | Worn-in, neutrals, no obvious brand logos (no Lululemon, no GymShark). Older Tracksmith / unbranded basics. |
| Treatment | Shot on 35mm film, or simulated film grain in post. Low contrast. Slight green-blue cast. No sharpening. Skin tones honest, not retouched smooth. |
| Vial / product | Always in still-life. Concrete, tile, raw wood, stainless. Often paired with a printed COA, a notebook, a measuring tool. **Never on skin. Never in a hand reaching toward a mouth.** |
| Anti-references | Recess, Goop, Olipop (vibe-only). GymShark, Gorilla Mind (gym-bro). Any current peptide-clinic site (neon, clinical chrome). Bluum (the placeholder — pastels, friendly serif headlines). |

For the AI image-gen prompt template (when [SKA-14](/SKA/issues/SKA-14) production image-gen tool is decided), see `docs/brand/imagery-spec.md` — Designer to draft as part of [SKA-14](/SKA/issues/SKA-14).

---

## 6. Asset list — what the Designer delivers (v0)

Commit under `brand/` at repo root (CTO will integrate references — see [SKA-4](/SKA/issues/SKA-4)).

### 6.1 Logo

- `brand/logo/calilean-wordmark.svg` (master, 24pt grid)
- `brand/logo/calilean-wordmark-inverse.svg` (on dark)
- `brand/logo/calilean-wordmark-mono.svg` (single-color)
- `brand/logo/calilean-stacked.svg` (wordmark + descriptor)
- `brand/logo/calilean-app-icon.svg` (1024×1024, `c` mark on `--cl-coa`)
- `brand/logo/exports/` — PNG @1x/2x/3x, favicon set, OG image masters
- `brand/logo/clear-space.md` — clear-space and minimum-size rules

### 6.2 Type

- `brand/type/specimen.pdf` — type specimen (display + body + mono)
- `brand/type/loading.md` — `next/font` config snippet for CTO to copy

### 6.3 Color

- `brand/color/colors.json` — semantic tokens (consumed by Tailwind + Stitch)
- `brand/color/swatches.svg` — visual reference

### 6.4 Hero comps

- `brand/comps/hero-01.png` — homepage hero v0 (above-fold, with master tagline)
- `brand/comps/hero-02.png` — PDP hero v0 (single SKU, wordmark, COA reference)
- `brand/comps/hero-03.png` — Education Hub hero v0 (long-form lead-in)

Each comp: 1440×1024 desktop + 390×844 mobile. Annotated layer if structural decisions need explanation.

### 6.5 Packaging direction

- `brand/packaging/vial-template.svg` — 5mg lyophilized vial label + box wrap, 60×30mm label area, 4-color spec
- `brand/packaging/principles.md` — what goes on the front (wordmark + compound name + dose), what goes on the back (batch, COA URL, RUO disclaimer, manufacturer, lot date)
- One rendered mockup of the BPC-157 5mg as the reference SKU

---

## 7. Process & sequencing

1. **Week 1 (this week):** wordmark exploration. 5 directions on the Salt & Iron palette, 1 round of CMO + CEO review, narrow to 2.
2. **Week 2:** wordmark final + monogram exploration + type specimen + color tokens shipped to CTO.
3. **Week 3:** 3 hero comps + packaging template. Designer pairs with CTO on token rename PR ([SKA-4](/SKA/issues/SKA-4)).
4. **Week 4:** PDP comp + 1 BPC-157 packaging render. Designer hands off to CTO for storefront integration.

**Gates:**
- Designer must have read `docs/brand/identity-brief.md` v1.1 (RUO) before starting. **Do not work from the v1 draft if you somehow have it — it pre-dates the RUO pivot.**
- Trademark clearance on "CaliLean" (CEO + counsel, [SKA-1](/SKA/issues/SKA-1) §9 open item) gates *finalizing* the wordmark — not exploration.
- Image-gen provider decision (board, [SKA-14](/SKA/issues/SKA-14)) gates *production* of hero comps — not direction.

---

## 8. What I'm NOT briefing you on (and why)

- **Iconography library beyond the v0 set.** Build only what the storefront needs. If we add an Education Hub deeper navigation, we'll spec then.
- **Motion / animation language.** Out of scope for v0. Storefront has none today and CTO has bigger fish.
- **Email design system.** Will brief separately when [SKA-11](/SKA/issues/SKA-11) email templates land.
- **Social templates.** [SKA-10](/SKA/issues/SKA-10) channel strategy will define the format mix; design system follows that.

---

## 9. Decisions I want pushback on (if any)

- "No mark on day one." If the designer feels strongly we need a mark for app icon/social avatar parity — say so in writing, before week 1. Default is wordmark-only.
- Söhne licensing cost. If it's prohibitive, propose Inter as body + a different display-serif pairing. Get CMO sign-off on the alternate **before** building the type specimen.
- Photography model — real South Bay athletes vs cast actors. Real is harder logistically; if it kills the timeline, we revisit.

Everything else: brief is locked. Build.
