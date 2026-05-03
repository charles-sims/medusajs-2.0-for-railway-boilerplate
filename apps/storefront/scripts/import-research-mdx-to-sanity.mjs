import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import matter from "gray-matter"
import { createClient } from "@sanity/client"

const storefrontDir = process.cwd()
const repoRoot = path.resolve(storefrontDir, "../..")

loadEnvFile(path.join(repoRoot, "apps/backend/.env"))
loadEnvFile(path.join(storefrontDir, ".env.local"))

const args = process.argv.slice(2).filter((arg) => arg !== "--")
const handle = args[0] || "bpc-157"
const explicitProductId = args[1]
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production"
const token = process.env.SANITY_API_TOKEN
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_API_VERSION ||
  "2024-11-18"

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing Sanity configuration. Set SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN."
  )
}

const mdxPath = path.join(storefrontDir, "content", "research", `${handle}.mdx`)
if (!fs.existsSync(mdxPath)) {
  throw new Error(`No research MDX file found at ${mdxPath}`)
}

const source = fs.readFileSync(mdxPath, "utf8")
const { data } = matter(source)
const title = typeof data.title === "string" ? data.title : handle

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

let existing

try {
  existing = await client.fetch(
    `*[
      _type == "product" &&
      (
        ($productId != "" && _id == $productId) ||
        productHandle == $handle ||
        title == $title
      )
    ][0]{_id}`,
    {
      productId: explicitProductId || "",
      handle,
      title,
    }
  )
} catch (error) {
  handleSanityError(error)
}

const documentId = existing?._id || explicitProductId || `product-${handle}`

try {
  if (existing?._id) {
    await client
      .patch(documentId)
      .set({
        title,
        productHandle: handle,
        researchMdx: source,
      })
      .setIfMissing({ specs: [] })
      .commit({ autoGenerateArrayKeys: true })
  } else {
    await client.createIfNotExists({
      _id: documentId,
      _type: "product",
      title,
      productHandle: handle,
      researchMdx: source,
      specs: [],
    })
  }
} catch (error) {
  handleSanityError(error)
}

console.log(`Imported ${handle} research MDX to Sanity document ${documentId}`)

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue
    }

    const index = trimmed.indexOf("=")
    const key = trimmed.slice(0, index).trim()
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "")

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function handleSanityError(error) {
  if (error?.statusCode === 401) {
    throw new Error(
      `Sanity rejected the configured token for project ${projectId}. Generate a write token for this project or set SANITY_PROJECT_ID to the token's project.`
    )
  }

  throw error
}
