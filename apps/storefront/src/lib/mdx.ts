import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import { createClient } from "@sanity/client"
import { mdxComponents } from "@modules/calilean/components/mdx-components"

const CONTENT_DIR = path.join(process.cwd(), "content", "research")

type ResearchContentInput = {
  productId?: string
  handle: string
}

type SanityProductResearch = {
  researchMdx?: string | null
}

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
export async function getResearchContent(input: string | ResearchContentInput) {
  const { productId, handle } =
    typeof input === "string" ? { handle: input } : input

  const sanitySource = await getSanityResearchMdx({ productId, handle })
  if (sanitySource) {
    return compileResearchSource(sanitySource)
  }

  const filePath = path.join(CONTENT_DIR, `${handle}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const source = fs.readFileSync(filePath, "utf-8")
  return compileResearchSource(source)
}

async function compileResearchSource(source: string) {
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

async function getSanityResearchMdx({
  productId,
  handle,
}: ResearchContentInput): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  if (!projectId || !dataset) {
    return null
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-18",
    useCdn: false,
  })

  try {
    const doc = await client.fetch<SanityProductResearch | null>(
      `*[
        _type == "product" &&
        defined(researchMdx) &&
        (
          ($productId != "" && _id == $productId) ||
          productHandle == $handle
        )
      ][0]{researchMdx}`,
      {
        productId: productId || "",
        handle,
      }
    )

    return doc?.researchMdx?.trim() || null
  } catch (error) {
    console.warn("Falling back to local research MDX after Sanity error", error)
    return null
  }
}

export type ResearchHeading = {
  id: string
  text: string
  level: number
}

/**
 * Extract headings from raw MDX source for the sticky nav.
 * Picks up both markdown ## headings AND component-based sections
 * (<Overview>, <ResearchApplications>, <ComparisonTable>, <Safety>, <References>).
 * Also includes the auto-generated "Specifications" and "Certificate of Analysis"
 * sections that render from product metadata.
 */
function extractHeadings(source: string): ResearchHeading[] {
  const headings: ResearchHeading[] = []

  // Component-based sections with their IDs and display names
  const componentSections: Array<{ tag: string; id: string; text: string }> = [
    { tag: "<Overview", id: "overview", text: "Overview" },
    {
      tag: "## Mechanism",
      id: "mechanism-of-action",
      text: "Mechanism of Action",
    },
    {
      tag: "<ResearchApplications",
      id: "research-applications",
      text: "Research Applications",
    },
    { tag: "<ComparisonTable", id: "compound-comparison", text: "Comparison" },
    { tag: "<Safety", id: "safety-handling", text: "Safety & Handling" },
    { tag: "<References", id: "references", text: "References" },
  ]

  // Scan source for each component/heading in order
  for (const section of componentSections) {
    if (source.includes(section.tag)) {
      headings.push({ id: section.id, text: section.text, level: 2 })
    }
  }

  // Always add specs and COA (rendered from product metadata, not MDX)
  headings.push({ id: "specifications", text: "Specifications", level: 2 })
  headings.push({
    id: "certificate-of-analysis",
    text: "Certificate of Analysis",
    level: 2,
  })

  return headings
}
