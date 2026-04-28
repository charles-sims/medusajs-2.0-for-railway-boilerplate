# CaliLean Rebrand v2 — Design Spec

**Date:** 2026-04-27
**Status:** Approved
**Approach:** Token-first rebrand — update design tokens and assets, let components cascade

---

## 1. Color Palette

Replace the "Salt & Iron" warm palette with a clean white + carolina blue + black system.

| Token | CSS Variable | Old Hex | New Hex | Role |
|---|---|---|---|---|
| bg | `--cl-bg` | `#F4F2EC` | `#FFFFFF` | Page backgrounds, surfaces |
| ink | `--cl-ink` | `#1F2326` | `#111111` | Body text, headings |
| pacific | `--cl-pacific` | `#3A5A6A` | `#7090AB` | Carolina blue — accent, links, primary CTAs |
| fog | `--cl-fog` | `#9CA3A8` | `#9CA3A8` | Unchanged — muted/secondary text |
| sand | `--cl-sand` | `#E6E2D6` | `#F0F0F0` | Light gray surfaces, card backgrounds, borders |
| coa | `--cl-coa` | `#0F1417` | `#111111` | Dark sections (footer, age gate) |
| alert | `--cl-alert` | `#A23B2A` | `#A23B2A` | Unchanged — RUO warning accent |

### Retired rules
- "No pure white anywhere" — retired. White is the new background standard.
- "No sand-on-cream buttons" — retired. Sand is now neutral gray.
- Warm surface ladder — retired. Surfaces are white or light gray.

### Section color assignments
| Section | Background |
|---|---|
| Announcement bar | `--cl-pacific` (carolina blue) |
| Lab banner | `--cl-pacific` (carolina blue) |
| Footer | `--cl-coa` (black) |
| Age gate | `--cl-coa` (black) |
| Hero CTA button | `--cl-pacific` (carolina blue) |

---

## 2. Typography

Single-family system using Plus Jakarta Sans (Google Fonts, SIL OFL).

| Role | Old Family | New Family | Weight |
|---|---|---|---|
| Display / headlines | Fraunces (serif) | Plus Jakarta Sans | 700 |
| Body / UI | Inter | Plus Jakarta Sans | 400, 500, 600 |
| Mono / data | JetBrains Mono | JetBrains Mono (keep) | 400 |

### Implementation
- `layout.tsx`: Remove Fraunces and Inter imports. Add single Plus Jakarta Sans import via `next/font/google` with weights 300–700, `display: "swap"`, latin subset.
- `--font-display` and `--font-sans` both point to Plus Jakarta Sans.
- `--font-mono` stays JetBrains Mono.
- Tailwind `fontFamily.sans` and `fontFamily.display` both resolve to `var(--font-sans)`.
- Headline distinction is weight (700) + size, not a separate typeface.

### Forbidden fonts (updated)
Fraunces, Switzer, Avenir, Proxima, Gotham, Circular, Visby, any humanist-rounded sans.

---

## 3. Logo & Favicon

### Wordmark
- **Old:** Inline SVG rendering "calilean" in Fraunces serif with `tracking` prop.
- **New:** PNG-based `<Image>` component loading from `/brand/logo/`.
- **Source assets:** `docs/brand/logo/master/calilean-logo-black.png`, `calilean-logo-white.png`
- **Destination:** `storefront/public/brand/logo/calilean-logo-black.png`, `calilean-logo-white.png`
- **Props:** `color: "black" | "white"`, `className` for sizing. Drop `tracking` prop.

### Variant usage
| Location | Variant |
|---|---|
| Nav header | Black (on white bg) |
| Footer | White (on black bg) |
| Age gate modal | White (on black bg) |
| Lab banner | White (on blue bg) |
| Email templates | Black |

### Favicon
- Source: `docs/brand/logo/master/calilean-favicon-black.png`
- Generate `favicon.ico` (16x16, 32x32) from the CL monogram PNG.
- Replace `favicon-c.svg` and `safari-pinned-tab.svg`.
- Update `site.webmanifest`: `background_color: "#FFFFFF"`, `theme_color: "#7090AB"`.

---

## 4. Product Images

Copy 8 v3 renders to storefront public directory, then upload to MinIO and update Medusa product thumbnails.

| Source (docs/brand/imagery/renders/v3/) | Destination (storefront/public/brand/products/) |
|---|---|
| `bpc-157-20mg.jpeg` | `bpc-157/pdp-primary.jpg` |
| `tb-500-10mg.jpeg` | `tb-500/pdp-primary.jpg` |
| `retatrutide-30mg.jpeg` | `retatrutide/pdp-primary.jpg` |
| `nad-500mg.jpeg` | `nad/pdp-primary.jpg` |
| `glutathione-500mg.jpeg` | `glutathione/pdp-primary.jpg` |
| `mots-c-10mg.jpeg` | `mots-c/pdp-primary.jpg` |
| `recovery-stack-10mg.jpeg` | `bpc-157-tb-500-blend/pdp-primary.jpg` |
| `gh-axis-stack-10mg.jpeg` | `cjc-1295-no-dac-ipamorelin-blend/pdp-primary.jpg` |

Thumbnail component (`thumbnail/index.tsx`): background auto-updates from warm sand to light gray via `--cl-sand` token change.

---

## 5. Component Overrides

Components with hardcoded colors that need manual updates beyond the token cascade:

### Announcement bar (`announcement-bar/index.tsx`)
- `bg-calilean-coa` → `bg-calilean-pacific`

### Lab banner (`lab-banner/index.tsx`)
- `bg-calilean-coa` → `bg-calilean-pacific`

### Hero (`hero/index.tsx`)
- CTA button: `bg-calilean-coa text-calilean-bg` → `bg-calilean-pacific text-white`
- Background overlay auto-updates via `--cl-bg` (now white)

### Trust badges (`trust-badges/index.tsx`)
- `bg-gray-50` → `bg-calilean-sand` for token consistency

### Email brand constants (`backend/src/modules/email-notifications/lib/brand.ts`)
- Update `COLORS` object to match new hex values:
  - `bg: "#FFFFFF"`, `ink: "#111111"`, `pacific: "#7090AB"`, `sand: "#F0F0F0"`, `coa: "#111111"`
  - `border: "#F0F0F0"`, `divider: "#E5E5E5"`

### Footer, age gate, nav, product cards, specs table, FAQ
- Auto-update via CSS token changes. No manual edits needed.

---

## 6. Brand Documentation Updates

| File | Action |
|---|---|
| `DESIGN.md` | New palette, new fonts, retire warm-surface rules |
| `docs/brand/identity-brief.md` | New palette, typography, logo, visual direction |
| `docs/brand/wordmark-brief.md` | Mark superseded — wordmark is a delivered PNG |
| `docs/brand/storefront-copy.md` | Update color name references |
| `storefront/src/styles/calilean-tokens.css` | New hex values (primary change file) |
| `storefront/tailwind.config.js` | Update font families |
| `storefront/src/app/layout.tsx` | Swap font imports |

---

## 7. Files Changed (Complete List)

### Token / config layer
- `storefront/src/styles/calilean-tokens.css`
- `storefront/tailwind.config.js`
- `storefront/src/app/layout.tsx`
- `storefront/public/site.webmanifest`

### Assets
- `storefront/public/brand/logo/calilean-logo-black.png` (new)
- `storefront/public/brand/logo/calilean-logo-white.png` (new)
- `storefront/public/favicon.ico` (replaced)
- `storefront/public/favicon-c.svg` (removed or replaced)
- `storefront/public/safari-pinned-tab.svg` (removed or replaced)
- `storefront/public/brand/products/*/pdp-primary.jpg` (8 files, replaced)

### Components
- `storefront/src/modules/calilean/icons/calilean-logo.tsx`
- `storefront/src/modules/calilean/components/announcement-bar/index.tsx`
- `storefront/src/modules/calilean/components/lab-banner/index.tsx`
- `storefront/src/modules/home/components/hero/index.tsx`
- `storefront/src/modules/calilean/components/trust-badges/index.tsx`

### Backend
- `backend/src/modules/email-notifications/lib/brand.ts`

### Documentation
- `DESIGN.md`
- `docs/brand/identity-brief.md`
- `docs/brand/wordmark-brief.md`
- `docs/brand/storefront-copy.md`

---

## 8. Out of Scope

- Copy/messaging changes (hero headline, taglines, FAQ text — unchanged)
- Product data (prices, descriptions, variants — unchanged)
- Checkout flow, cart, account pages — auto-update via tokens
- MinIO product image upload — requires running backend, handled as post-deploy step
- Hero background image — keeps current image, overlay shifts to white automatically
