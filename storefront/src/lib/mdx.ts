import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import { mdxComponents } from "@modules/calilean/components/mdx-components"

const CONTENT_DIR = path.join(process.cwd(), "content", "research")

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
    { tag: "## Mechanism", id: "mechanism-of-action", text: "Mechanism of Action" },
    { tag: "<ResearchApplications", id: "research-applications", text: "Research Applications" },
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
  headings.push({ id: "certificate-of-analysis", text: "Certificate of Analysis", level: 2 })

  return headings
}
