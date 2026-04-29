# Product Research Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rich, MDX-powered research content (mechanism of action, research applications, comparison tables, molecular diagrams, scientific references, COA viewer) to every CaliLean product page.

**Architecture:** Hybrid data model — research narratives live as MDX files in `storefront/content/research/{handle}.mdx` with custom React components, while chemical specs and COA data stay in Medusa product metadata. Product pages conditionally render the research layout when an MDX file exists for the product handle, otherwise fall back to the existing clean product page.

**Tech Stack:** next-mdx-remote (MDX compilation), React 19, Next.js 15, Tailwind CSS 3, TypeScript 5

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `storefront/src/lib/mdx.ts` | MDX loading, compilation, and heading extraction utilities |
| `storefront/src/modules/calilean/components/research-layout/index.tsx` | Two-column layout wrapper (sticky nav + content area) |
| `storefront/src/modules/calilean/components/research-nav/index.tsx` | Client component: sticky side nav (desktop) / pill bar (mobile) with scroll tracking |
| `storefront/src/modules/calilean/components/research-overview/index.tsx` | Overview section wrapper |
| `storefront/src/modules/calilean/components/molecular-structure/index.tsx` | SVG molecular structure card |
| `storefront/src/modules/calilean/components/mechanism-diagram/index.tsx` | Pathway flow diagram |
| `storefront/src/modules/calilean/components/research-applications/index.tsx` | 2-column application card grid |
| `storefront/src/modules/calilean/components/comparison-table/index.tsx` | Compound comparison table |
| `storefront/src/modules/calilean/components/cited-reference/index.tsx` | `<Cite>`, `<Ref>`, `<References>` components |
| `storefront/src/modules/calilean/components/safety-section/index.tsx` | Safety & handling wrapper |
| `storefront/src/modules/calilean/components/mdx-components.ts` | Component map export for MDXRemote |
| `storefront/content/research/bpc-157.mdx` | BPC-157 research content (template for all others) |
| `storefront/content/research/tb-500.mdx` | TB-500 research content |
| `storefront/content/research/mots-c.mdx` | MOTS-C research content |
| `storefront/content/research/ghk-cu.mdx` | GHK-Cu research content |
| `storefront/content/research/ipamorelin.mdx` | Ipamorelin research content |
| `storefront/content/research/glp1-s.mdx` | GLP1-S research content |
| `storefront/content/research/glp2-t.mdx` | GLP2-T research content |
| `storefront/content/research/glp3-r.mdx` | GLP3-R research content |
| `storefront/content/research/tesamorelin.mdx` | Tesamorelin research content |
| `storefront/content/research/ss-31.mdx` | SS-31 research content |
| `storefront/content/research/wolverine.mdx` | Wolverine research content |
| `storefront/content/research/glow.mdx` | GLOW research content |
| `storefront/content/research/klow.mdx` | KLOW research content |
| `storefront/content/research/melanotan-2.mdx` | Melanotan 2 research content |
| `storefront/content/research/bac-water.mdx` | Bac Water research content (~200 words) |
| `storefront/public/research/structures/*.svg` | 14 molecular structure SVGs |

### Modified Files

| File | Changes |
|---|---|
| `storefront/package.json` | Add `next-mdx-remote` dependency |
| `storefront/src/modules/products/templates/index.tsx` | Conditionally render research layout when MDX exists |
| `storefront/src/modules/calilean/components/product-specs-table/index.tsx` | Restyle to match research section aesthetic |
| `storefront/src/modules/products/components/coa-panel/index.tsx` | Restyle with dark card, pacific blue accents |

---

### Task 1: Install next-mdx-remote and create MDX utility

**Files:**
- Modify: `storefront/package.json`
- Create: `storefront/src/lib/mdx.ts`

- [ ] **Step 1: Install next-mdx-remote**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm add next-mdx-remote
```

- [ ] **Step 2: Create the MDX utility module**

Create `storefront/src/lib/mdx.ts`:

```typescript
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import { mdxComponents } from "@modules/calilean/components/mdx-components"

const CONTENT_DIR = path.join(process.cwd(), "..", "storefront", "content", "research")

/**
 * Check if an MDX research file exists for a given product handle.
 */
export function hasResearchContent(handle: string): boolean {
  const filePath = path.join(CONTENT_DIR, `${handle}.mdx`)
  return fs.existsSync(filePath)
}

/**
 * Load and compile MDX content for a product handle.
 * Returns null if no MDX file exists.
 */
export async function getResearchContent(handle: string) {
  const filePath = path.join(CONTENT_DIR, `${handle}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const source = fs.readFileSync(filePath, "utf-8")
  const { content, data: frontmatter } = matter(source)

  const { content: compiled } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  })

  const headings = extractHeadings(content)

  return {
    content: compiled,
    frontmatter,
    headings,
  }
}

export type ResearchHeading = {
  id: string
  text: string
  level: number
}

/**
 * Extract h2/h3 headings from raw MDX source for the sticky nav.
 * Also picks up component-based sections like <Overview>, <Safety>, <References>.
 */
function extractHeadings(source: string): ResearchHeading[] {
  const headings: ResearchHeading[] = []

  // Match markdown headings: ## Heading or ### Heading
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match
  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    headings.push({ id, text, level })
  }

  return headings
}
```

- [ ] **Step 3: Check if gray-matter is needed as a dependency**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm add gray-matter
```

- [ ] **Step 4: Verify the content directory path resolves correctly**

The storefront runs from `storefront/` as cwd. The content dir needs to resolve to `storefront/content/research/`. Update the CONTENT_DIR if needed:

```typescript
// In storefront/src/lib/mdx.ts, update CONTENT_DIR to:
const CONTENT_DIR = path.join(process.cwd(), "content", "research")
```

Since `process.cwd()` in Next.js is the storefront root, this resolves to `storefront/content/research/`.

- [ ] **Step 5: Create the content directory**

```bash
mkdir -p /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront/content/research
mkdir -p /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront/public/research/structures
```

- [ ] **Step 6: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/package.json storefront/pnpm-lock.yaml storefront/src/lib/mdx.ts storefront/content/research storefront/public/research/structures
git commit -m "feat: add next-mdx-remote and MDX loading utility"
```

---

### Task 2: Create MDX component map and Overview component

**Files:**
- Create: `storefront/src/modules/calilean/components/mdx-components.ts`
- Create: `storefront/src/modules/calilean/components/research-overview/index.tsx`
- Create: `storefront/src/modules/calilean/components/molecular-structure/index.tsx`

- [ ] **Step 1: Create the overview component**

Create `storefront/src/modules/calilean/components/research-overview/index.tsx`:

```tsx
import React from "react"

type OverviewProps = {
  children: React.ReactNode
}

const Overview: React.FC<OverviewProps> = ({ children }) => {
  return (
    <section id="overview" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Overview
      </h2>
      <div className="text-sm text-calilean-fog leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}

export default Overview
```

- [ ] **Step 2: Create the molecular structure component**

Create `storefront/src/modules/calilean/components/molecular-structure/index.tsx`:

```tsx
import React from "react"
import Image from "next/image"
import fs from "fs"
import path from "path"

type MolecularStructureProps = {
  src: string
}

const MolecularStructure: React.FC<MolecularStructureProps> = ({ src }) => {
  const svgPath = path.join(process.cwd(), "public", "research", "structures", `${src}.svg`)
  if (!fs.existsSync(svgPath)) return null

  return (
    <div className="float-right ml-6 mb-4 w-[140px] shrink-0">
      <div className="border border-calilean-sand rounded-lg p-4 bg-white">
        <Image
          src={`/research/structures/${src}.svg`}
          alt={`${src} molecular structure`}
          width={120}
          height={120}
          className="w-full h-auto"
        />
      </div>
      <p className="text-[10px] text-calilean-fog text-center mt-1">Molecular Structure</p>
    </div>
  )
}

export default MolecularStructure
```

- [ ] **Step 3: Create the MDX component map (placeholder — will add components as we build them)**

Create `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"

export const mdxComponents = {
  Overview,
  MolecularStructure,
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/research-overview/index.tsx storefront/src/modules/calilean/components/molecular-structure/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add Overview and MolecularStructure MDX components"
```

---

### Task 3: Create MechanismDiagram component

**Files:**
- Create: `storefront/src/modules/calilean/components/mechanism-diagram/index.tsx`
- Modify: `storefront/src/modules/calilean/components/mdx-components.ts`

- [ ] **Step 1: Create the mechanism diagram component**

Create `storefront/src/modules/calilean/components/mechanism-diagram/index.tsx`:

```tsx
import React from "react"

type Step = {
  label: string
  type: "input" | "pathway" | "output"
}

type MechanismDiagramProps = {
  steps: Step[]
}

const stepStyles: Record<Step["type"], string> = {
  input:
    "border-calilean-ink bg-white text-calilean-ink font-semibold",
  pathway:
    "border-calilean-sand bg-white text-calilean-fog",
  output:
    "border-[#7090AB] bg-[#7090AB]/10 text-[#7090AB] font-semibold",
}

const MechanismDiagram: React.FC<MechanismDiagramProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null

  return (
    <div className="my-6 rounded-lg border border-calilean-sand bg-calilean-bg p-5">
      <p className="text-[10px] uppercase tracking-widest text-calilean-fog mb-4">
        Signaling Pathway
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden small:flex items-center justify-center gap-3 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-calilean-fog/40 text-lg select-none">&rarr;</span>
            )}
            <span
              className={`inline-flex items-center px-4 py-2.5 rounded-full border text-xs ${stepStyles[step.type]}`}
            >
              {step.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex small:hidden flex-col items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-calilean-fog/40 text-lg select-none">&darr;</span>
            )}
            <span
              className={`inline-flex items-center px-4 py-2.5 rounded-full border text-xs ${stepStyles[step.type]}`}
            >
              {step.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default MechanismDiagram
```

- [ ] **Step 2: Add MechanismDiagram to the component map**

Update `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"
import MechanismDiagram from "./mechanism-diagram"

export const mdxComponents = {
  Overview,
  MolecularStructure,
  MechanismDiagram,
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/mechanism-diagram/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add MechanismDiagram MDX component"
```

---

### Task 4: Create ResearchApplications component

**Files:**
- Create: `storefront/src/modules/calilean/components/research-applications/index.tsx`
- Modify: `storefront/src/modules/calilean/components/mdx-components.ts`

- [ ] **Step 1: Create the research applications component**

Create `storefront/src/modules/calilean/components/research-applications/index.tsx`:

```tsx
import React from "react"

type ApplicationProps = {
  title: string
  children: React.ReactNode
}

export const Application: React.FC<ApplicationProps> = ({ title, children }) => {
  return (
    <div className="rounded-lg border border-calilean-sand bg-white p-4">
      <h4 className="text-sm font-semibold text-calilean-ink mb-2">{title}</h4>
      <div className="text-sm text-calilean-fog leading-relaxed">{children}</div>
    </div>
  )
}

type ResearchApplicationsProps = {
  children: React.ReactNode
}

const ResearchApplications: React.FC<ResearchApplicationsProps> = ({ children }) => {
  return (
    <section id="research-applications" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Research Applications
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  )
}

export default ResearchApplications
```

- [ ] **Step 2: Add to component map**

Update `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"
import MechanismDiagram from "./mechanism-diagram"
import ResearchApplications, { Application } from "./research-applications"

export const mdxComponents = {
  Overview,
  MolecularStructure,
  MechanismDiagram,
  ResearchApplications,
  Application,
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/research-applications/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add ResearchApplications MDX component"
```

---

### Task 5: Create ComparisonTable component

**Files:**
- Create: `storefront/src/modules/calilean/components/comparison-table/index.tsx`
- Modify: `storefront/src/modules/calilean/components/mdx-components.ts`

- [ ] **Step 1: Create the comparison table component**

Create `storefront/src/modules/calilean/components/comparison-table/index.tsx`:

```tsx
import React from "react"

type ComparisonTableProps = {
  compounds: string[]
  rows: Array<{
    label: string
    values: string[]
  }>
  highlightIndex?: number
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  compounds,
  rows,
  highlightIndex = 0,
}) => {
  if (!compounds || !rows || compounds.length === 0) return null

  return (
    <section id="compound-comparison" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Compound Comparison
      </h2>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-calilean-sand">
              <th className="text-left py-3 pr-4 text-calilean-fog font-medium w-[120px] sticky left-0 bg-white z-10" />
              {compounds.map((compound, i) => (
                <th
                  key={compound}
                  className={`text-center py-3 px-3 font-semibold ${
                    i === highlightIndex
                      ? "text-[#7090AB]"
                      : "text-calilean-fog"
                  }`}
                >
                  {compound}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-calilean-sand">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-3 pr-4 text-calilean-fog font-medium sticky left-0 bg-white z-10">
                  {row.label}
                </td>
                {row.values.map((value, i) => (
                  <td
                    key={i}
                    className={`py-3 px-3 text-center ${
                      i === highlightIndex
                        ? "text-calilean-ink"
                        : "text-calilean-fog"
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ComparisonTable
```

- [ ] **Step 2: Add to component map**

Update `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"
import MechanismDiagram from "./mechanism-diagram"
import ResearchApplications, { Application } from "./research-applications"
import ComparisonTable from "./comparison-table"

export const mdxComponents = {
  Overview,
  MolecularStructure,
  MechanismDiagram,
  ResearchApplications,
  Application,
  ComparisonTable,
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/comparison-table/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add ComparisonTable MDX component"
```

---

### Task 6: Create Cite, Ref, and References components

**Files:**
- Create: `storefront/src/modules/calilean/components/cited-reference/index.tsx`
- Modify: `storefront/src/modules/calilean/components/mdx-components.ts`

- [ ] **Step 1: Create the cited reference components**

Create `storefront/src/modules/calilean/components/cited-reference/index.tsx`:

```tsx
"use client"

import React, { createContext, useContext, useState } from "react"

type RefData = {
  id: number
  authors: string
  title: string
  journal: string
  year: number
  pmid: string
  url?: string
}

const ReferencesContext = createContext<{
  refs: Map<number, RefData>
  register: (ref: RefData) => void
}>({
  refs: new Map(),
  register: () => {},
})

// --- Cite (inline [n] link) ---

type CiteProps = {
  id: number
}

export const Cite: React.FC<CiteProps> = ({ id }) => {
  const { refs } = useContext(ReferencesContext)
  const ref = refs.get(id)
  const title = ref?.title || `Reference ${id}`

  return (
    <a
      href={`#ref-${id}`}
      title={title}
      className="inline-flex items-center px-1.5 py-0.5 bg-[#7090AB]/10 rounded text-[11px] font-medium text-[#7090AB] no-underline hover:bg-[#7090AB]/20 transition-colors"
    >
      {id}
    </a>
  )
}

// --- Ref (single reference entry) ---

type RefProps = {
  id: number
  authors: string
  title: string
  journal: string
  year: number
  pmid: string
  url?: string
}

export const Ref: React.FC<RefProps> = (props) => {
  const { register } = useContext(ReferencesContext)

  // Register on first render
  React.useEffect(() => {
    register(props)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const href = props.url || `https://pubmed.ncbi.nlm.nih.gov/${props.pmid}/`

  return (
    <li id={`ref-${props.id}`} className="py-1.5 text-[11px] leading-relaxed text-calilean-fog">
      <span className="text-[#7090AB] font-medium mr-1">[{props.id}]</span>
      {props.authors} &ldquo;{props.title}&rdquo;{" "}
      <em>{props.journal}.</em> {props.year}.{" "}
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[#7090AB] underline-offset-2 hover:underline"
      >
        PubMed
      </a>
    </li>
  )
}

// --- References (wrapper with collapsible) ---

type ReferencesProps = {
  children: React.ReactNode
}

export const References: React.FC<ReferencesProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(false)
  const [refs] = useState<Map<number, RefData>>(new Map())

  const register = (ref: RefData) => {
    refs.set(ref.id, ref)
  }

  return (
    <ReferencesContext.Provider value={{ refs, register }}>
      <section id="references" className="scroll-mt-24">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand"
        >
          <span>References</span>
          <span className="text-calilean-fog text-sm font-normal">
            {expanded ? "Collapse" : "Expand"}
          </span>
        </button>
        {expanded && (
          <ol className="list-none space-y-0 divide-y divide-calilean-sand/50">
            {children}
          </ol>
        )}
      </section>
    </ReferencesContext.Provider>
  )
}
```

- [ ] **Step 2: Add to component map**

Update `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"
import MechanismDiagram from "./mechanism-diagram"
import ResearchApplications, { Application } from "./research-applications"
import ComparisonTable from "./comparison-table"
import { Cite, Ref, References } from "./cited-reference"

export const mdxComponents = {
  Overview,
  MolecularStructure,
  MechanismDiagram,
  ResearchApplications,
  Application,
  ComparisonTable,
  Cite,
  Ref,
  References,
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/cited-reference/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add Cite, Ref, and References MDX components"
```

---

### Task 7: Create Safety section component

**Files:**
- Create: `storefront/src/modules/calilean/components/safety-section/index.tsx`
- Modify: `storefront/src/modules/calilean/components/mdx-components.ts`

- [ ] **Step 1: Create the safety section component**

Create `storefront/src/modules/calilean/components/safety-section/index.tsx`:

```tsx
import React from "react"

type SafetyProps = {
  children: React.ReactNode
}

const Safety: React.FC<SafetyProps> = ({ children }) => {
  return (
    <section id="safety-handling" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Safety &amp; Handling
      </h2>
      <div className="rounded-lg border border-amber-200/60 bg-amber-50/30 p-4">
        <div className="text-sm text-calilean-fog leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </section>
  )
}

export const SafetyFallback: React.FC = () => {
  return (
    <Safety>
      <p>
        Handle with appropriate personal protective equipment (PPE) including gloves
        and eye protection. Store lyophilized product at -20°C. Reconstituted solutions
        should be stored at 2-8°C and used within the recommended timeframe.
      </p>
      <p>
        Refer to the Certificate of Analysis and Safety Data Sheet for complete
        storage, handling, and disposal guidance specific to this compound.
      </p>
    </Safety>
  )
}

export default Safety
```

- [ ] **Step 2: Add to component map**

Update `storefront/src/modules/calilean/components/mdx-components.ts`:

```typescript
import Overview from "./research-overview"
import MolecularStructure from "./molecular-structure"
import MechanismDiagram from "./mechanism-diagram"
import ResearchApplications, { Application } from "./research-applications"
import ComparisonTable from "./comparison-table"
import { Cite, Ref, References } from "./cited-reference"
import Safety from "./safety-section"

export const mdxComponents = {
  Overview,
  MolecularStructure,
  MechanismDiagram,
  ResearchApplications,
  Application,
  ComparisonTable,
  Cite,
  Ref,
  References,
  Safety,
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/safety-section/index.tsx storefront/src/modules/calilean/components/mdx-components.ts
git commit -m "feat: add Safety MDX component with fallback"
```

---

### Task 8: Create ResearchNav component (sticky side nav / mobile pill bar)

**Files:**
- Create: `storefront/src/modules/calilean/components/research-nav/index.tsx`

- [ ] **Step 1: Create the research nav component**

This is a client component that tracks scroll position and highlights the active section.

Create `storefront/src/modules/calilean/components/research-nav/index.tsx`:

```tsx
"use client"

import React, { useEffect, useState } from "react"
import type { ResearchHeading } from "@lib/mdx"

type ResearchNavProps = {
  headings: ResearchHeading[]
}

const ResearchNav: React.FC<ResearchNavProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (headings.length === 0) return null

  return (
    <>
      {/* Desktop: sticky side nav */}
      <nav className="hidden large:block sticky top-24 w-[180px] shrink-0 self-start">
        <p className="text-[9px] uppercase tracking-widest text-calilean-fog mb-3">
          On this page
        </p>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => handleClick(h.id)}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors ${
                  activeId === h.id
                    ? "bg-[#7090AB]/10 text-[#7090AB] border-l-2 border-[#7090AB]"
                    : "text-calilean-fog hover:text-calilean-ink"
                }`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: horizontal scrollable pill bar */}
      <nav className="large:hidden sticky top-[64px] z-30 bg-white border-b border-calilean-sand -mx-4 px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => handleClick(h.id)}
              className={`whitespace-nowrap text-xs py-1.5 px-3 rounded-full border transition-colors ${
                activeId === h.id
                  ? "bg-[#7090AB]/10 border-[#7090AB] text-[#7090AB]"
                  : "border-calilean-sand text-calilean-fog hover:text-calilean-ink"
              }`}
            >
              {h.text}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

export default ResearchNav
```

- [ ] **Step 2: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/research-nav/index.tsx
git commit -m "feat: add ResearchNav with scroll tracking and mobile pill bar"
```

---

### Task 9: Create ResearchLayout wrapper

**Files:**
- Create: `storefront/src/modules/calilean/components/research-layout/index.tsx`

- [ ] **Step 1: Create the research layout component**

This server component wraps the MDX content with the sticky nav and handles the two-column layout.

Create `storefront/src/modules/calilean/components/research-layout/index.tsx`:

```tsx
import React from "react"
import ResearchNav from "@modules/calilean/components/research-nav"
import type { ResearchHeading } from "@lib/mdx"

type ResearchLayoutProps = {
  headings: ResearchHeading[]
  children: React.ReactNode
}

const ResearchLayout: React.FC<ResearchLayoutProps> = ({ headings, children }) => {
  return (
    <div className="content-container py-12 border-t border-calilean-sand">
      <ResearchNav headings={headings} />
      <div className="large:flex large:gap-12">
        {/* Desktop side nav takes space via ResearchNav's sticky positioning */}
        <div className="hidden large:block w-[180px] shrink-0" aria-hidden="true" />

        <div className="flex-1 min-w-0 space-y-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ResearchLayout
```

Wait — the ResearchNav is rendered inside this layout for desktop but also needs to be outside the flex container for mobile (sticky top bar). Let me rethink:

Actually, the ResearchNav renders both desktop and mobile variants internally (hidden/shown via CSS). The desktop version uses `sticky` positioning inside the flex. The layout needs to include the nav *inside* the flex for desktop. Let me revise:

```tsx
import React from "react"
import ResearchNav from "@modules/calilean/components/research-nav"
import type { ResearchHeading } from "@lib/mdx"

type ResearchLayoutProps = {
  headings: ResearchHeading[]
  children: React.ReactNode
}

const ResearchLayout: React.FC<ResearchLayoutProps> = ({ headings, children }) => {
  return (
    <div className="content-container py-12 border-t border-calilean-sand">
      {/* Mobile pill bar (rendered by ResearchNav, hidden on large) */}
      {/* Desktop side nav (rendered by ResearchNav, hidden below large) */}
      <div className="large:flex large:gap-12">
        <ResearchNav headings={headings} />

        <div className="flex-1 min-w-0 space-y-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ResearchLayout
```

- [ ] **Step 2: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/research-layout/index.tsx
git commit -m "feat: add ResearchLayout wrapper with two-column layout"
```

---

### Task 10: Restyle ProductSpecsTable

**Files:**
- Modify: `storefront/src/modules/calilean/components/product-specs-table/index.tsx`

- [ ] **Step 1: Read the current component**

Read `storefront/src/modules/calilean/components/product-specs-table/index.tsx` (40 lines — see File Structure section for current code).

- [ ] **Step 2: Restyle to match research section aesthetic**

Replace the full contents of `storefront/src/modules/calilean/components/product-specs-table/index.tsx`:

```tsx
import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
}

const ProductSpecsTable = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, string>

  const specs = [
    { label: "Application", value: meta.application },
    { label: "Appearance", value: meta.appearance || "Solid, white powder in 3mL glass ampule" },
    { label: "Chemical Formula", value: meta.formula },
    { label: "CAS Number", value: meta.cas },
    { label: "Molecular Weight", value: meta.mw },
    { label: "PubChem CID", value: meta.pubchem },
    { label: "Storage", value: meta.storage },
  ].filter((s) => s.value)

  if (specs.length === 0) return null

  return (
    <section id="specifications" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Product Specifications
      </h2>
      <div className="rounded-lg border border-calilean-sand overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {specs.map((s, i) => (
              <tr
                key={s.label}
                className={i < specs.length - 1 ? "border-b border-calilean-sand" : ""}
              >
                <td className="py-3 px-4 font-medium text-calilean-fog bg-calilean-bg w-[140px] align-top">
                  {s.label}
                </td>
                <td className="py-3 px-4 text-calilean-ink">
                  {s.label === "Chemical Formula" ? (
                    <span className="font-mono">{s.value}</span>
                  ) : (
                    s.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProductSpecsTable
```

Key changes:
- Section wrapper with `id="specifications"` and `scroll-mt-24` for sticky nav targeting
- Heading matches other research sections (text-lg, font-bold, bottom border)
- Table wrapped in rounded bordered container
- Alternating row background with `bg-calilean-bg` on label cells
- Chemical formula in monospace font
- Consistent spacing with other research sections

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/calilean/components/product-specs-table/index.tsx
git commit -m "feat: restyle ProductSpecsTable to match research section aesthetic"
```

---

### Task 11: Restyle COA Panel

**Files:**
- Modify: `storefront/src/modules/products/components/coa-panel/index.tsx`

- [ ] **Step 1: Read the current component**

Read `storefront/src/modules/products/components/coa-panel/index.tsx` (162 lines — see File Structure section for current code).

- [ ] **Step 2: Restyle with dark card background and pacific blue accents**

Replace the full contents of `storefront/src/modules/products/components/coa-panel/index.tsx`:

```tsx
import { HttpTypes } from "@medusajs/types"

import {
  buildFileLinks,
  resolveCoaPanel,
  type CoaBatchValues,
  type CoaTier,
} from "./resolve"

type Props = {
  product: HttpTypes.StoreProduct
}

const STANDARD_ASSAYS: { label: string; detail: string }[] = [
  {
    label: "Purity by HPLC",
    detail:
      "Per-batch reverse-phase HPLC chromatogram showing purity percentage and impurity profile.",
  },
]

const EXTENDED_ASSAYS: { label: string; detail: string }[] = [
  ...STANDARD_ASSAYS,
  {
    label: "Identity confirmation by LC-MS/MS (triple-quad)",
    detail:
      "Mass-spec identity confirmation against the expected molecular ion to verify the compound is what the label claims.",
  },
  {
    label: "Independent endotoxin re-test",
    detail:
      "Per-batch LAL (Limulus amebocyte lysate) re-test by an independent lab in addition to the manufacturing facility's in-line check.",
  },
  {
    label: "Per-batch reference-standard comparison",
    detail:
      "Each batch is compared against an internally retained reference standard to catch drift between manufacturing runs.",
  },
]

const HEADINGS: Record<CoaTier, string> = {
  standard: "Certificate of Analysis",
  extended: "Certificate of Analysis (extended panel)",
}

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-2 inline-flex items-center rounded-full border border-calilean-sand px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-calilean-fog">
    {children}
  </span>
)

const ValueRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-calilean-sand p-3">
    <p className="text-[10px] uppercase tracking-widest text-calilean-fog">{label}</p>
    <p className="text-sm font-semibold text-calilean-ink mt-1">{value}</p>
  </div>
)

const renderValueGrid = (batch: CoaBatchValues, tier: CoaTier) => {
  const items: { label: string; value: string; highlight?: boolean }[] = []
  if (batch.hplc_purity_pct) {
    items.push({ label: "HPLC Purity", value: `${batch.hplc_purity_pct}%`, highlight: true })
  }
  if (tier === "extended") {
    if (batch.lcms_identity) {
      items.push({
        label: "LCMS Identity",
        value: batch.lcms_identity.confirmed ? "✓ Confirmed" : "Not confirmed",
      })
    }
    if (batch.endotoxin_eu_per_mg) {
      items.push({ label: "Endotoxin", value: `${batch.endotoxin_eu_per_mg} EU/mg` })
    }
    if (batch.ref_standard_match_pct) {
      items.push({ label: "Ref Standard Match", value: `${batch.ref_standard_match_pct}%` })
    }
  }
  if (items.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {items.map((item) => (
        <ValueRow key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  )
}

const COAPanel = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, unknown>
  const resolved = resolveCoaPanel(meta.coa_panel)
  const { tier, effectiveTier, batchId, batch, pending, extendedDeferred } =
    resolved

  const heading = HEADINGS[tier]
  const fileLinks = buildFileLinks(batch?.files)
  const displayBatchId =
    batchId || (typeof meta.batch === "string" ? meta.batch : null)

  return (
    <section id="certificate-of-analysis" className="scroll-mt-24" data-testid={`coa-panel-${effectiveTier}`}>
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        {heading}
        {pending && <Pill>COA pending</Pill>}
        {extendedDeferred && <Pill>Extended panel pending</Pill>}
      </h2>

      <div className="rounded-lg border border-calilean-sand bg-calilean-bg p-5">
        {/* Batch header */}
        {displayBatchId && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-calilean-ink">Batch #{displayBatchId}</p>
              {batch?.issued_at && (
                <p className="text-[11px] text-calilean-fog mt-0.5">
                  Issued: {new Date(batch.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
            {batch?.hplc_purity_pct && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#7090AB]/10 text-[#7090AB] text-xs font-semibold">
                {batch.hplc_purity_pct}% HPLC Purity
              </span>
            )}
          </div>
        )}

        {/* Test result grid */}
        {batch && renderValueGrid(batch, effectiveTier)}

        {/* Assay list */}
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-calilean-fog mb-2">
            Assays included
          </p>
          <ul className="space-y-2">
            {(effectiveTier === "extended" ? EXTENDED_ASSAYS : STANDARD_ASSAYS).map((a) => (
              <li key={a.label} className="text-xs text-calilean-fog">
                <span className="font-medium text-calilean-ink">{a.label}</span>
                {" — "}
                {a.detail}
              </li>
            ))}
          </ul>
        </div>

        {/* Download links */}
        {fileLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-calilean-sand">
            {fileLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-calilean-sand text-xs font-medium text-[#7090AB] hover:bg-[#7090AB]/5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default COAPanel
```

Key changes:
- Section wrapper with `id="certificate-of-analysis"` and `scroll-mt-24`
- Heading matches other research sections
- Card with `bg-calilean-bg` background and rounded border
- Batch header with pacific blue purity pill badge
- Test results in a 2-column grid layout instead of list
- Assay list compact with inline descriptions
- Download buttons as styled cards with document icon SVG
- Mobile-friendly: grid stacks, buttons wrap

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/products/components/coa-panel/index.tsx
git commit -m "feat: restyle COA panel with dark card and pacific blue accents"
```

---

### Task 12: Integrate research layout into ProductTemplate

**Files:**
- Modify: `storefront/src/modules/products/templates/index.tsx`

- [ ] **Step 1: Read the current template**

Read `storefront/src/modules/products/templates/index.tsx` (64 lines — see File Structure section for current code).

- [ ] **Step 2: Add research layout integration**

Replace the full contents of `storefront/src/modules/products/templates/index.tsx`:

```tsx
import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import TrustBadges from "@modules/calilean/components/trust-badges"
import RUODisclaimer from "@modules/common/components/ruo-disclaimer"
import ProductSpecsTable from "@modules/calilean/components/product-specs-table"
import COAPanel from "@modules/products/components/coa-panel"
import ResearchLayout from "@modules/calilean/components/research-layout"
import { SafetyFallback } from "@modules/calilean/components/safety-section"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { getResearchContent } from "@lib/mdx"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) return notFound()

  const research = await getResearchContent(product.handle || "")

  return (
    <>
      {/* Hero section — unchanged */}
      <div className="content-container py-8 small:py-12" data-testid="product-container">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-12 items-start">
          <div className="small:sticky small:top-24">
            <ImageGallery images={product?.images || []} />
          </div>

          <div className="flex flex-col gap-y-8">
            <ProductInfo product={product} />

            <Suspense
              fallback={<ProductActions disabled={true} product={product} region={region} />}
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            <TrustBadges />
            <RUODisclaimer variant="short" />

            {/* If no research content, show specs and COA inline (existing layout) */}
            {!research && (
              <>
                <ProductSpecsTable product={product} />
                <COAPanel product={product} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Research content section — only renders when MDX exists */}
      {research && (
        <ResearchLayout headings={research.headings}>
          {research.content}
          <ProductSpecsTable product={product} />
          <COAPanel product={product} />
          {/* SafetyFallback renders if <Safety> wasn't in the MDX */}
        </ResearchLayout>
      )}

      {/* Related products — unchanged */}
      <div className="content-container my-16 small:my-24 border-t border-calilean-sand pt-16" data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
```

Key changes:
- Import `getResearchContent` from `@lib/mdx`
- Make the component `async` (it's already a server component)
- Call `getResearchContent(product.handle)` at top level
- Conditionally render: if research exists, move specs/COA into the ResearchLayout; otherwise keep them in the hero column (existing behavior)
- Import `ResearchLayout` and `SafetyFallback`

- [ ] **Step 3: Verify the build compiles**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm build
```

Expected: Build succeeds. Product pages without MDX files render identically to before. If there are type errors, fix them.

- [ ] **Step 4: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/src/modules/products/templates/index.tsx
git commit -m "feat: integrate research layout into product template"
```

---

### Task 13: Write BPC-157 MDX research content (template for all others)

**Files:**
- Create: `storefront/content/research/bpc-157.mdx`

- [ ] **Step 1: Research BPC-157 using PubMed sources**

Search PubMed for BPC-157 primary research papers. Key PMIDs to find:
- Sikiric et al. reviews on BPC 157 and its pharmacological effects
- Chang et al. on promoting effect on tendon healing
- Sebecic et al. on osteogenic effects
- Tkalcevic et al. on wound healing enhancement
- Seiwerth et al. on gastrointestinal cytoprotection

Gather: mechanism details, signaling pathways, research application domains, safety/handling notes.

- [ ] **Step 2: Write the BPC-157 MDX file**

Create `storefront/content/research/bpc-157.mdx`:

```mdx
---
title: BPC-157
subtitle: Tissue Repair Peptide
---

<Overview>
<MolecularStructure src="bpc-157" />

BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide derived from a protective protein found in human gastric juice. Consisting of 15 amino acids (Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val), it has been the subject of extensive preclinical investigation since its initial characterization in the early 1990s. <Cite id={1} />

In non-clinical models, BPC-157 has demonstrated a broad cytoprotective profile across multiple organ systems, with particular research interest in gastrointestinal, musculoskeletal, and neurological experimental models. The compound is notable for its stability in gastric acid conditions, distinguishing it from most peptides that degrade rapidly in acidic environments. <Cite id={2} />

BPC-157 is available in lyophilized form in 5mg, 10mg, and 20mg research quantities.
</Overview>

## Mechanism of Action

BPC-157 research has identified several intersecting signaling pathways in preclinical experimental systems. The compound's effects appear to involve modulation of the nitric oxide (NO) system, which plays a central role in vascular regulation and tissue repair processes observed in animal models. <Cite id={3} />

<MechanismDiagram
  steps={[
    { label: "BPC-157", type: "input" },
    { label: "NO System", type: "pathway" },
    { label: "VEGF / FGF-2", type: "pathway" },
    { label: "Angiogenesis", type: "pathway" },
    { label: "Tissue Repair", type: "output" }
  ]}
/>

In experimental systems, BPC-157 has been observed to upregulate vascular endothelial growth factor (VEGF) and fibroblast growth factor 2 (FGF-2) expression, both of which are key mediators of angiogenesis — the formation of new blood vessels from existing vasculature. <Cite id={4} /> This pro-angiogenic activity has been documented across multiple tissue types in preclinical models, suggesting a mechanism that may underlie the compound's observed effects across different organ systems.

Additionally, preclinical studies have reported interactions with the FAK-paxillin signaling pathway, which regulates cell migration, adhesion, and cytoskeletal reorganization — processes fundamental to tissue remodeling in experimental wound models. <Cite id={5} />

<ResearchApplications>
<Application title="Gastrointestinal Models">
BPC-157 was originally isolated from gastric juice proteins, and gastrointestinal research remains its most extensively studied domain. In preclinical models, the compound has been investigated in the context of experimentally-induced gastric ulcers, inflammatory bowel conditions, and esophageal damage. Studies in animal models have reported accelerated mucosal healing and reduced inflammatory markers. <Cite id={1} />
</Application>

<Application title="Musculoskeletal Research">
In preclinical musculoskeletal models, BPC-157 has been studied in the context of tendon, ligament, muscle, and bone injury. Experimental studies have reported accelerated tendon-to-bone healing in rat models and enhanced osteogenic activity in bone defect models. <Cite id={6} />
</Application>

<Application title="Neuroprotection Studies">
A growing body of preclinical research has examined BPC-157 in neurological experimental systems. Animal studies have investigated the compound in models of peripheral nerve injury, traumatic brain injury, and dopaminergic system modulation. <Cite id={7} />
</Application>

<Application title="Cardiovascular Models">
In preclinical cardiovascular research, BPC-157 has been investigated for its effects on vascular function and blood pressure regulation in experimental models. Studies have reported modulation of the NO system in vascular tissue preparations. <Cite id={3} />
</Application>
</ResearchApplications>

<ComparisonTable
  compounds={["BPC-157", "TB-500", "Wolverine"]}
  rows={[
    { label: "Classification", values: ["Pentadecapeptide", "Thymosin Beta-4 fragment", "BPC-157 + GHK-Cu blend"] },
    { label: "Amino Acids", values: ["15", "43", "15 + 3 (blend)"] },
    { label: "Primary Pathway", values: ["Nitric oxide / VEGF", "Actin polymerization", "Multi-pathway"] },
    { label: "Origin", values: ["Gastric juice protein", "Thymus gland", "Synthetic blend"] },
    { label: "Stability", values: ["Acid-stable", "Requires reconstitution", "Requires reconstitution"] },
    { label: "Research Focus", values: ["GI / musculoskeletal", "Cellular migration / repair", "Combined tissue support"] }
  ]}
/>

<Safety>
Handle BPC-157 with appropriate personal protective equipment (PPE) including nitrile gloves and safety glasses. Avoid inhalation of lyophilized powder.

**Storage:** Store lyophilized product at -20°C protected from light. Reconstituted solutions should be stored at 2-8°C and used within 30 days.

**Spill response:** Collect spilled material with inert absorbent. Dispose of in accordance with local regulations for laboratory chemical waste.

**Documentation:** Record lot number, date of receipt, storage conditions, and date of reconstitution for all research records.
</Safety>

<References>
<Ref id={1} authors="Sikiric P, Seiwerth S, Rucman R, et al." title="Stable gastric pentadecapeptide BPC 157: novel therapy in gastrointestinal tract" journal="Curr Pharm Des" year={2011} pmid="21861833" />
<Ref id={2} authors="Sikiric P, Seiwerth S, Rucman R, et al." title="Brain-gut axis and pentadecapeptide BPC 157: theoretical and practical implications" journal="Curr Neuropharmacol" year={2016} pmid="26813123" />
<Ref id={3} authors="Seiwerth S, Brcic L, Vuletic LB, et al." title="BPC 157 and blood vessels" journal="Curr Pharm Des" year={2014} pmid="24934946" />
<Ref id={4} authors="Chang CH, Tsai WC, Lin MS, et al." title="The promoting effect of pentadecapeptide BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration" journal="J Appl Physiol" year={2011} pmid="21885802" />
<Ref id={5} authors="Hsieh MJ, Lee CH, Chueh HY, et al." title="BPC-157 promotes tendon-bone healing through FAK-paxillin signaling pathway in a rat model" journal="Biomedicines" year={2020} pmid="33138247" />
<Ref id={6} authors="Sebecic B, Nikolic V, Sikiric P, et al." title="Osteogenic effect of a gastric pentadecapeptide, BPC-157, on the healing of segmental bone defect in rabbits" journal="J Orthop Res" year={1999} pmid="10602899" />
<Ref id={7} authors="Tudor M, Jandric I, Marovic A, et al." title="Traumatic brain injury in mice: the effect of pentadecapeptide BPC 157" journal="Regul Pept" year={2010} pmid="20362013" />
</References>
```

- [ ] **Step 3: Verify the page renders**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm dev
```

Navigate to `http://localhost:8000/us/products/bpc-157`. Verify:
- Overview section renders with text
- Mechanism diagram shows pathway flow
- Research applications show as 2-column cards
- Comparison table renders with BPC-157 column highlighted
- Safety section renders in amber-bordered card
- References section is collapsible
- Specs table and COA panel appear within the research layout
- Sticky side nav appears on desktop, pill bar on mobile

- [ ] **Step 4: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/content/research/bpc-157.mdx
git commit -m "feat: add BPC-157 research content (MDX template)"
```

---

### Task 14: Write remaining 14 MDX research content files

**Files:**
- Create: `storefront/content/research/tb-500.mdx`
- Create: `storefront/content/research/mots-c.mdx`
- Create: `storefront/content/research/ghk-cu.mdx`
- Create: `storefront/content/research/ipamorelin.mdx`
- Create: `storefront/content/research/glp1-s.mdx`
- Create: `storefront/content/research/glp2-t.mdx`
- Create: `storefront/content/research/glp3-r.mdx`
- Create: `storefront/content/research/tesamorelin.mdx`
- Create: `storefront/content/research/ss-31.mdx`
- Create: `storefront/content/research/wolverine.mdx`
- Create: `storefront/content/research/glow.mdx`
- Create: `storefront/content/research/klow.mdx`
- Create: `storefront/content/research/melanotan-2.mdx`
- Create: `storefront/content/research/bac-water.mdx`

Each file follows the same structure as `bpc-157.mdx` from Task 13. Each file must:

1. Have frontmatter with `title` and `subtitle`
2. Include `<Overview>` with compound description (~200 words)
3. Include `<MolecularStructure src="{handle}" />` (except Bac Water)
4. Include `## Mechanism of Action` with `<MechanismDiagram>` showing the primary signaling pathway
5. Include `<ResearchApplications>` with 2-4 `<Application>` cards
6. Include `<ComparisonTable>` using the groupings from the spec
7. Include `<Safety>` section
8. Include `<References>` with 5-10 PubMed-cited sources
9. Use strict RUO language — no dosing, no human application, qualifiers on every claim
10. Target ~1,000 words per peptide, ~200 words for Bac Water

**Comparison groupings to use:**
- TB-500: compare with BPC-157 and Wolverine
- MOTS-C: compare with SS-31
- GHK-Cu: compare with GLOW and KLOW
- Ipamorelin: compare with Tesamorelin
- GLP1-S: compare with GLP2-T and GLP3-R
- GLP2-T: compare with GLP1-S and GLP3-R
- GLP3-R: compare with GLP1-S and GLP2-T
- Tesamorelin: compare with Ipamorelin
- SS-31: compare with MOTS-C
- Wolverine: compare with BPC-157 and TB-500
- GLOW: compare with KLOW and GHK-Cu
- KLOW: compare with GLOW and GHK-Cu
- Melanotan 2: compare with Melanotan I (external, not in catalog)
- Bac Water: no comparison table, no mechanism diagram, just Overview + Safety

- [ ] **Step 1: Research and write TB-500 MDX**

Research TB-500 (Thymosin Beta-4 fragment 17-23) on PubMed. Key topics: actin sequestration and polymerization, cell migration, Tβ4 pathway, wound healing models, cardiovascular research. Write `storefront/content/research/tb-500.mdx` following the BPC-157 template structure.

- [ ] **Step 2: Research and write MOTS-C MDX**

Research MOTS-C (Mitochondrial Open Reading Frame of the 12S rRNA Type-C) on PubMed. Key topics: mitochondrial-derived peptide, AMPK activation, metabolic regulation, exercise mimetic properties, insulin sensitivity. Write `storefront/content/research/mots-c.mdx`.

- [ ] **Step 3: Research and write GHK-Cu MDX**

Research GHK-Cu (copper peptide) on PubMed. Key topics: copper-binding tripeptide, collagen synthesis, wound healing, gene expression modulation, antioxidant activity. Write `storefront/content/research/ghk-cu.mdx`.

- [ ] **Step 4: Research and write Ipamorelin MDX**

Research Ipamorelin on PubMed. Key topics: growth hormone secretagogue, ghrelin receptor (GHS-R1a) agonist, selective GH release, bone density research, body composition studies. Write `storefront/content/research/ipamorelin.mdx`.

- [ ] **Step 5: Research and write GLP1-S (Semaglutide) MDX**

Research Semaglutide on PubMed. Key topics: GLP-1 receptor agonist, incretin pathway, glucose-dependent insulin secretion, gastric emptying, metabolic research. Write `storefront/content/research/glp1-s.mdx`.

- [ ] **Step 6: Research and write GLP2-T (Tirzepatide) MDX**

Research Tirzepatide on PubMed. Key topics: dual GIP/GLP-1 receptor agonist, twincretin mechanism, glucose homeostasis research, body weight studies. Write `storefront/content/research/glp2-t.mdx`.

- [ ] **Step 7: Research and write GLP3-R (Retatrutide) MDX**

Research Retatrutide on PubMed. Key topics: triple agonist (GIP/GLP-1/glucagon), tri-agonist mechanism, metabolic research, energy expenditure. Write `storefront/content/research/glp3-r.mdx`.

- [ ] **Step 8: Research and write Tesamorelin MDX**

Research Tesamorelin on PubMed. Key topics: GHRH analog, growth hormone-releasing hormone, visceral adipose tissue research, IGF-1 modulation. Write `storefront/content/research/tesamorelin.mdx`.

- [ ] **Step 9: Research and write SS-31 (Elamipretide) MDX**

Research SS-31 on PubMed. Key topics: mitochondria-targeted peptide, cardiolipin interaction, electron transport chain, mitochondrial dysfunction, oxidative stress. Write `storefront/content/research/ss-31.mdx`.

- [ ] **Step 10: Research and write Wolverine MDX**

Research BPC-157 + GHK-Cu blend properties. Note: this is a proprietary blend, so reference the individual compound literature from BPC-157 and GHK-Cu entries, explaining the rationale for combination. Write `storefront/content/research/wolverine.mdx`.

- [ ] **Step 11: Research and write GLOW (Glutathione) MDX**

Research Glutathione on PubMed. Key topics: master antioxidant, redox homeostasis, detoxification, immune function, cellular defense mechanisms. Write `storefront/content/research/glow.mdx`.

- [ ] **Step 12: Research and write KLOW (NAD+) MDX**

Research NAD+ on PubMed. Key topics: nicotinamide adenine dinucleotide, sirtuin activation, cellular energy metabolism, DNA repair, aging research. Write `storefront/content/research/klow.mdx`.

- [ ] **Step 13: Research and write Melanotan 2 MDX**

Research Melanotan II on PubMed. Key topics: melanocortin receptor agonist, MC1R/MC4R, melanogenesis, synthetic analog of α-MSH. Write `storefront/content/research/melanotan-2.mdx`.

- [ ] **Step 14: Write Bac Water MDX (~200 words, minimal)**

Write `storefront/content/research/bac-water.mdx`:

```mdx
---
title: Bacteriostatic Water
subtitle: Reconstitution Solvent
---

<Overview>
Bacteriostatic water (USP) is sterile water containing 0.9% benzyl alcohol as a bacteriostatic preservative. It is the standard reconstitution solvent for lyophilized peptide research materials.

The benzyl alcohol preservative inhibits bacterial growth, allowing multiple withdrawals from a single vial over a defined use period — typically up to 28 days when stored at controlled room temperature (20-25°C) or under refrigeration (2-8°C).

Bacteriostatic water is available in 30mL glass vials.
</Overview>

<Safety>
Handle with standard laboratory precautions. Use aseptic technique when withdrawing from the vial.

**Storage:** Store at controlled room temperature (20-25°C). Do not freeze. Protect from light. Once opened, use within 28 days.

**Compatibility:** Bacteriostatic water is suitable for reconstituting lyophilized peptides. Do not use for intravenous injection or applications requiring preservative-free water.

**Disposal:** Dispose of unused material in accordance with local laboratory waste regulations.
</Safety>
```

- [ ] **Step 15: Verify all 15 product pages render**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm build
```

Navigate to each product page and verify the research content renders correctly.

- [ ] **Step 16: Commit all MDX files**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/content/research/
git commit -m "feat: add research content for all 15 products"
```

---

### Task 15: Create molecular structure SVGs

**Files:**
- Create: `storefront/public/research/structures/bpc-157.svg`
- Create: `storefront/public/research/structures/tb-500.svg`
- Create: `storefront/public/research/structures/mots-c.svg`
- Create: `storefront/public/research/structures/ghk-cu.svg`
- Create: `storefront/public/research/structures/ipamorelin.svg`
- Create: `storefront/public/research/structures/glp1-s.svg`
- Create: `storefront/public/research/structures/glp2-t.svg`
- Create: `storefront/public/research/structures/glp3-r.svg`
- Create: `storefront/public/research/structures/tesamorelin.svg`
- Create: `storefront/public/research/structures/ss-31.svg`
- Create: `storefront/public/research/structures/wolverine.svg`
- Create: `storefront/public/research/structures/glow.svg`
- Create: `storefront/public/research/structures/klow.svg`
- Create: `storefront/public/research/structures/melanotan-2.svg`

- [ ] **Step 1: Source molecular structure images**

For each compound, obtain the 2D molecular structure from PubChem:
1. Search for the compound on PubChem (https://pubchem.ncbi.nlm.nih.gov/)
2. Download the 2D structure as SVG from the compound page
3. Clean the SVG: remove PubChem branding, optimize for web display
4. Save as `storefront/public/research/structures/{handle}.svg`

For larger peptides (BPC-157, TB-500, MOTS-C) where 2D structures are too complex to be readable at thumbnail size, create a simplified representation:
- Use the amino acid sequence as a clean typographic SVG
- Or use a simplified backbone diagram

For Wolverine (blend), create a combined representation showing both BPC-157 and GHK-Cu structures.

- [ ] **Step 2: Verify all SVGs load in the MolecularStructure component**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm dev
```

Navigate to each product page and verify the molecular structure renders in the Overview section.

- [ ] **Step 3: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/public/research/structures/
git commit -m "feat: add molecular structure SVGs for all peptides"
```

---

### Task 16: Final integration test and cleanup

**Files:**
- No new files

- [ ] **Step 1: Run the full build**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront && pnpm lint
```

Expected: No lint errors. Fix any that appear.

- [ ] **Step 3: Test product page without MDX (graceful fallback)**

Navigate to a product that does NOT have an MDX file (if any exist in the catalog beyond the 15). Verify it renders the existing layout without research sections.

- [ ] **Step 4: Test desktop layout**

Navigate to `http://localhost:8000/us/products/bpc-157` at >1024px width. Verify:
- Sticky side nav appears on left
- Active section highlights on scroll
- Clicking nav items smooth-scrolls to section
- All 8 sections render (Overview, Specs, Mechanism, Applications, Comparison, COA, Safety, References)
- Molecular structure floats right in Overview
- Mechanism diagram shows horizontal flow
- Comparison table highlights BPC-157 column

- [ ] **Step 5: Test mobile layout**

At <1024px width, verify:
- Horizontal pill bar appears below header
- Pills scroll horizontally
- Active pill highlights
- Comparison table scrolls horizontally with sticky first column
- Mechanism diagram shows vertical flow
- Application cards stack to single column
- COA download buttons stack

- [ ] **Step 6: Commit any fixes**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add -A
git commit -m "fix: address integration test findings"
```
