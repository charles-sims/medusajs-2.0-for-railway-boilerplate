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
 * Extract h2/h3 headings from raw MDX source for the sticky nav.
 */
function extractHeadings(source: string): ResearchHeading[] {
  const headings: ResearchHeading[] = []

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
