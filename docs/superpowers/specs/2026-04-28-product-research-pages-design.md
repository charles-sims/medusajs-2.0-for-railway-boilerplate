# Product Research Pages — Design Spec

## Goal

Add rich, research-backed content to every CaliLean product page — mechanism of action, research applications, comparison tables, molecular diagrams, scientific references, and an interactive COA viewer — differentiating CaliLean from competitors (Bluum, Penguin) who offer either walls of text with no visuals or near-zero educational content.

## Scope

- 15 products: 14 peptides (~1,000 words each) + Bac Water (~200 words, specs only)
- Consistent depth across all products (no thin pages)
- All content uses strict RUO (Research Use Only) language — no dosing, no human application
- Progressive enhancement: products without MDX files render the existing clean product page

## Architecture

### Data Layer Split

| Content Type | Storage | Rationale |
|---|---|---|
| Research narrative (overview, mechanism, applications, safety, references) | `storefront/content/research/{handle}.mdx` | Rich formatting, React components, git-tracked, doesn't change per batch |
| Chemical specs (formula, CAS, MW, etc.) | `product.metadata` (existing) | Already built, admin-editable |
| COA data (purity %, batch ID, test results) | `product.metadata.coa_panel` (existing) | Changes per batch, admin-editable |
| COA PDFs | MinIO bucket `medusa-media/coa/{handle}/{batch-id}.pdf` | Controlled URLs, no third-party dependency |
| Molecular structure images | `storefront/public/research/structures/{handle}.svg` | Static assets, one per peptide |
| Mechanism diagrams | Inline in MDX as React components | Custom per peptide, full creative control |

### MDX Files

```
storefront/content/research/
├── bpc-157.mdx
├── tb-500.mdx
├── mots-c.mdx
├── ghk-cu.mdx
├── ipamorelin.mdx
├── glp1-s.mdx
├── glp2-t.mdx
├── glp3-r.mdx
├── tesamorelin.mdx
├── ss-31.mdx
├── wolverine.mdx
├── glow.mdx
├── klow.mdx
├── melanotan-2.mdx
└── bac-water.mdx
```

### Rendering Logic

1. Product page loads product from Medusa API (existing flow, no changes)
2. Server component checks if MDX file exists for `product.handle`
3. If MDX exists → render full research page layout with sticky nav + research sections + existing specs/COA/trust badges
4. If no MDX → render existing clean product page (specs + COA + trust badges only)
5. No broken pages, no empty sections — graceful degradation

### MDX Processing

- Use `next-mdx-remote` for server-side MDX compilation
- Custom components passed via `MDXRemote` components prop
- Frontmatter parsed for metadata (title, subtitle)

## Page Layout

### Desktop (>1024px)

Top-to-bottom page flow:

1. **Product Hero** (existing, no changes) — image gallery, subtitle, title, metadata badges, variant selector, price, add to cart, trust badges, RUO disclaimer
2. **Research Content Area** (new) — two-column layout:
   - Left: sticky side nav ("On this page") auto-generated from MDX headings, highlights active section on scroll
   - Right: main content with sections stacked vertically
3. **Related Products** (existing, no changes) — 4-product grid

### Research Content Sections (in order)

1. **Overview** — introductory text with molecular structure SVG floated right
2. **Specs Table** — rendered from `product.metadata` (existing component, restyled to match)
3. **Mechanism of Action** — narrative text with inline citations + pathway diagram component
4. **Research Applications** — 2-4 cards in a 2-column grid, each with title and summary
5. **Compound Comparison** — table comparing current product with 1-2 related products from catalog
6. **Certificate of Analysis** — rendered from `product.metadata.coa_panel` (existing component, restyled) with batch info, test results, downloadable PDF links from MinIO
7. **Safety & Handling** — from MDX `<Safety>` block, or generic fallback
8. **References** — numbered citations with PubMed links, collapsible

### Mobile (<1024px)

- Sticky side nav becomes horizontal scrollable pill bar fixed below header
- Active section pill highlighted; tapping smooth-scrolls to section
- Research application cards stack to single column
- Comparison tables scroll horizontally with sticky first column (property labels)
- Mechanism diagrams wrap to multiple rows, horizontal arrows become downward arrows
- COA download buttons stack full-width

## MDX Component Library

Custom React components available inside MDX files:

### `<Overview>`
Wrapper for the overview text block. Renders as the first section.

### `<MolecularStructure src="bpc-157" />`
Loads SVG from `public/research/structures/{src}.svg`. Renders as a bordered card floated to the right of the overview text. Falls back to hidden if SVG doesn't exist.

### `<MechanismDiagram steps={[...]} />`
Renders a horizontal pathway flow diagram. Each step has `label` and `type` ("input" | "pathway" | "output"). Last step (output) highlighted in pacific blue (`#7090AB`). Wraps to vertical on mobile.

Props:
```ts
interface MechanismDiagramProps {
  steps: Array<{
    label: string
    type: "input" | "pathway" | "output"
  }>
}
```

### `<ResearchApplications>` + `<Application title="...">`
Container renders a 2-column card grid (1-column on mobile). Each `<Application>` is a card with title and markdown body content.

### `<ComparisonTable compounds={[...]} rows={[...]} />`
Renders a comparison table. Current product column highlighted. Horizontally scrollable on mobile with sticky first column.

Props:
```ts
interface ComparisonTableProps {
  compounds: string[]
  rows: Array<{
    label: string
    values: string[]
  }>
  highlightIndex?: number // defaults to 0 (current product)
}
```

### `<Cite id={n} />`
Inline citation rendered as `[n]` in pacific blue with hover tooltip showing reference title. Clicks scroll to References section.

### `<Safety>`
Wrapper for safety & handling content. Renders with a subtle warning-style border. If omitted from MDX, a generic lab safety disclaimer renders instead.

### `<References>` + `<Ref id={n} authors="..." title="..." journal="..." year={n} pmid="..." />`
Collapsible references section. Each `<Ref>` renders as a numbered entry with a link to PubMed (`https://pubmed.ncbi.nlm.nih.gov/{pmid}/`).

Props for `<Ref>`:
```ts
interface RefProps {
  id: number
  authors: string
  title: string
  journal: string
  year: number
  pmid: string
  url?: string // optional override for non-PubMed sources
}
```

## Research Content Spec

### Per-Product Content (~1,000 words, except Bac Water ~200 words)

| Section | Description | Source |
|---|---|---|
| Overview | What the compound is, origin, classification | PubChem + literature |
| Mechanism of Action | Signaling pathways, receptor interactions, cellular effects | PubMed primary sources |
| Research Applications | 2-4 domain cards (varies by peptide) | Preclinical study summaries |
| Comparison | Side-by-side with 1-2 related compounds from CaliLean catalog | Cross-product reference |
| Safety & Handling | PPE, storage, spill response, documentation | Standard lab protocols |
| References | 5-10 PubMed-cited sources | PubMed/PMC |

### Comparison Groupings

- **Tissue repair family:** BPC-157 ↔ TB-500 ↔ Wolverine
- **GLP receptor agonists:** GLP1-S ↔ GLP2-T ↔ GLP3-R
- **Growth hormone axis:** Ipamorelin ↔ Tesamorelin
- **Cellular health/longevity:** GHK-Cu ↔ GLOW ↔ KLOW
- **Mitochondrial peptides:** MOTS-C ↔ SS-31
- **Standalone:** Melanotan 2 (compared vs older MT-1)
- **No comparison:** Bac Water (specs and usage only)

### RUO Language Requirements

All research content must:
- Use "preclinical/in-vitro only" language throughout
- Never include dosing information
- Never imply human application
- Include qualifiers on every claim: "in non-clinical models," "in experimental systems," "in preclinical studies"
- Match the RUO positioning already established in `storefront/src/lib/ruo.ts`

## COA File Storage

### MinIO Structure

```
medusa-media/
└── coa/
    └── {handle}/
        └── {batch-id}/
            ├── standard-coa.pdf
            ├── chromatogram.pdf
            └── extended-panel.pdf
```

### URL Pattern

`https://{MINIO_HOST}/medusa-media/coa/{handle}/{batch-id}/standard-coa.pdf`

### Metadata Reference

COA file URLs stored in `product.metadata.coa_panel.batches[batchId].files`:
```json
{
  "standard_coa_pdf": "https://bucket-production-4a36.up.railway.app/medusa-media/coa/bpc-157/435410/standard-coa.pdf",
  "chromatogram": "https://bucket-production-4a36.up.railway.app/medusa-media/coa/bpc-157/435410/chromatogram.pdf",
  "extended_coa_pdf": "https://bucket-production-4a36.up.railway.app/medusa-media/coa/bpc-157/435410/extended-panel.pdf"
}
```

## Files to Create

### New Files
- `storefront/content/research/*.mdx` — 15 research content files
- `storefront/public/research/structures/*.svg` — 14 molecular structure SVGs (not Bac Water)
- `storefront/src/modules/calilean/components/research-layout/index.tsx` — sticky nav + content wrapper
- `storefront/src/modules/calilean/components/research-nav/index.tsx` — sticky side nav / mobile pill bar
- `storefront/src/modules/calilean/components/mechanism-diagram/index.tsx`
- `storefront/src/modules/calilean/components/comparison-table/index.tsx`
- `storefront/src/modules/calilean/components/research-applications/index.tsx`
- `storefront/src/modules/calilean/components/molecular-structure/index.tsx`
- `storefront/src/modules/calilean/components/cited-reference/index.tsx` — `<Cite>` and `<Ref>` components
- `storefront/src/modules/calilean/components/safety-section/index.tsx`
- `storefront/src/modules/calilean/components/research-overview/index.tsx`
- `storefront/src/lib/mdx.ts` — MDX loading and compilation utilities

### Modified Files
- `storefront/src/modules/products/templates/index.tsx` — integrate research layout below hero (conditionally render research sections when MDX exists, otherwise keep existing layout)
- `storefront/src/modules/calilean/components/product-specs-table/index.tsx` — restyle: match research section heading style (18px, white, bottom border), use same border-radius and background colors as other research section cards
- `storefront/src/modules/products/components/coa-panel/index.tsx` — restyle: dark card background (`#0d0d0d`), pacific blue purity badge pill, grid layout for test results, styled download buttons matching the mockup
- `storefront/package.json` — add `next-mdx-remote` dependency
- `storefront/next.config.mjs` — MDX configuration if needed

### No Changes
- Backend — no API changes, no new modules
- Product metadata schema — uses existing fields
- Trust badges, RUO disclaimer, product actions — unchanged
