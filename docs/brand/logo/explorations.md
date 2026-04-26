# CaliLean Wordmark — Three Cut Choices

The brand identity brief ([identity-brief.md](../identity-brief.md), §6) locked the system to a **wordmark-only identity**: lowercase `calilean`, single weight, low-contrast modern serif, generous tracking. What's left to decide is **which cut tone** the custom wordmark gets drawn against. Three serif families are referenced in the brief; this exploration previews each.

> Previews use freely-available web-serif approximations of the licensed display faces. The final wordmark will be **custom-drawn** against whichever family wins. Open the SVG files to read in detail.

---

## Cut 1 — Editorial Display *(brief lock recommendation)*

**Reference family:** GT Sectra Display.
**Web preview face:** Fraunces (variable, transitional with low-contrast display cut).
**Tone:** sharp, transitional-modern serif with subtle ink-trap detailing. Reads clinical-editorial, not literary, not fashion.

**Why it fits the brief:**
- "Sharp transitional or modern serif... low-contrast modern serif with subtle ink-trap detailing" — direct match.
- "Readable at 24px in nav, premium at 200pt on packaging" — Sectra-class display cuts hold both.
- "Confident, not cramped" — the cut's slight inktrap detailing carries premium without ornament.

**Strengths:** the safest interpretation of the brief — i.e. it does exactly what the brief asks. Pairs effortlessly with Söhne for body. Photographs well on packaging substrates.

**Risks:** if every premium-clinical brand picks this same cut family (Athletic Greens does adjacent), CaliLean can read as on-trend rather than distinctive. Mitigation: the custom draw should commit to one or two unique inktraps or a custom `a`.

---

## Cut 2 — Apothecary Display

**Reference family:** Tiempos Headline.
**Web preview face:** Cormorant Garamond.
**Tone:** warmer, more bookish, more humanist. Pulls toward Aesop and old apothecary catalogues.

**Why it could fit:**
- The brief's anti-reference list is long but Tiempos Headline is **named** as an alt in the type pairings (§7).
- If we lean into the "Aesop apothecary" half of the moodboard reference (§5), this cut earns its keep.
- Reads as quietly old-world — useful if the brand voice ever moves more "considered editorial" than "clinical-direct."

**Strengths:** softer, more human read. Better on packaging substrates with a tactile finish. Will not be mistaken for a tech brand.

**Risks:** brief §6 explicitly anti-patterns "Lowercase rounded grotesque à la Bluum / Recess" — a too-warm transitional could drift into adjacent territory. The cut needs enough display-level contrast to stay editorial, not friendly.

---

## Cut 3 — Modern Display

**Reference family:** Domaine Display.
**Web preview face:** Playfair Display (a higher-contrast didone-ish stand-in).
**Tone:** higher-contrast modern serif. More editorial-fashion, less clinical-editorial.

**Why it could fit:**
- Brief §6 names **Domaine Display** as an explicit alternate.
- If the team wants the brand to feel more "luxury drop / editorial fashion" than "premium-clinical," this is where you go.

**Strengths:** highest first-impression distinctiveness. Photographs incredibly well on a single-product hero.

**Risks per brief §6:** "Reads like a fashion brand, not a peptide brand." Needs photographic and copy discipline to keep clinical credibility — and the brief's voice rules already lean clinical-direct, so this cut and that voice would have to share work.

---

## Selection criteria

Rank these in order of importance, that should pick the cut:

1. **Match to brief §6's "low-contrast modern serif with subtle ink-trap detailing":** Cut 1 > Cut 2 > Cut 3
2. **Pairs cleanly with Söhne body face (brief §7):** Cut 1 > Cut 3 > Cut 2
3. **Won't be confused with a fashion or wellness adjacent brand:** Cut 1 > Cut 2 > Cut 3
4. **Survives at 24px nav size:** Cut 1 > Cut 2 > Cut 3 (display cuts get fragile at small sizes; Cut 3's high contrast loses thin strokes first)
5. **Survives at 200pt on packaging:** Cut 3 > Cut 2 > Cut 1 (high-contrast cuts gain presence at scale)

**Designer recommendation: Cut 1 (Editorial Display).** It's the closest read of the brief's literal direction, holds at both ends of the size range, and pairs without friction with the Söhne body face the brief locks. Cut 2 is a defensible runner-up if the team wants more warmth on packaging. Cut 3 is the most distinctive but bets the brand on a fashion-editorial read that the voice doesn't fully back.

---

## Tracking value to confirm

The brief specifies "+20 to +40 units at display size." That's a 2x range — the three SVGs all use **+30**. Once the cut is locked, designer + CMO should sit with these at three sizes (24px nav / 64pt display / 200pt packaging) and confirm:

- 24px nav → tight (+10 to +15 effective at small size)
- 64pt display → +30 (current preview)
- 200pt packaging → +40

Tracking on web is set per-size in DESIGN.md tokens; the SVG masters bake one tracking value and the storefront override scales it.

---

## What "v0 done" looks like once a cut is locked

- `wordmark.svg` (vector paths, no font dependency)
- `wordmark-with-rule.svg` (formal lockup variant per §6)
- PNG exports: nav (88, 176), display (320, 640), packaging (1280, 2560)
- Favicon ICO + Safari pinned-tab mask using a single-letter `c` lockup (since the monogram is deferred)
- DESIGN.md token entries: `--brand-wordmark-primary`, `--brand-wordmark-tracking-{nav,display,packaging}`
- Storefront integration: file a subtask under [SKA-4](/SKA/issues/SKA-4) to:
  - Replace `storefront/src/modules/bluum/icons/bluum-logo.tsx` with `calilean-wordmark.tsx`
  - Update `storefront/public/favicon.ico`
  - Remove `Switzer` from `storefront/tailwind.config.js` and add the new font stack

## What goes back to [SKA-9](/SKA/issues/SKA-9) (CMO designer-brief)

- Color tokens (palette A "Salt & Iron" recommendation in identity-brief.md §7)
- Type system tokens (Söhne / Inter body, Söhne Mono / JetBrains Mono technical)
- Iconography style
- Photography style direction
- Asset list
