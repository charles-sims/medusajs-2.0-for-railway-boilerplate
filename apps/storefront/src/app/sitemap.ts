import { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"
import { getCollectionsList } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"

const STATIC_PATHS = ["", "store", "account", "cart", "terms", "privacy"]

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL().replace(/\/$/, "")
  const now = new Date()

  let countryCodes: string[] = []
  try {
    const regions = await listRegions()
    countryCodes =
      (regions
        ?.flatMap((r) => r.countries?.map((c) => c.iso_2) ?? [])
        .filter(Boolean) as string[]) ?? []
  } catch {
    // Backend unreachable at build time (e.g. CI without backend) —
    // fall back to a default country so the sitemap route still renders.
  }

  if (countryCodes.length === 0) {
    countryCodes = ["us"]
  }

  const entries: MetadataRoute.Sitemap = []

  for (const countryCode of countryCodes) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${countryCode}${path ? `/${path}` : ""}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.6,
      })
    }
  }

  try {
    const { collections } = await getCollectionsList(0, 100)
    for (const countryCode of countryCodes) {
      for (const collection of collections ?? []) {
        if (!collection.handle) continue
        entries.push({
          url: `${base}/${countryCode}/collections/${collection.handle}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  } catch {
    // Skip collections if backend is unreachable.
  }

  try {
    const productLists = await Promise.all(
      countryCodes.map((countryCode) =>
        getProductsList({
          countryCode,
          queryParams: { limit: 100 },
        }).catch(() => null)
      )
    )

    productLists.forEach((result, idx) => {
      if (!result) return
      const countryCode = countryCodes[idx]
      for (const product of result.response.products) {
        if (!product.handle) continue
        const updatedAt = product.updated_at
          ? new Date(product.updated_at)
          : now
        entries.push({
          url: `${base}/${countryCode}/products/${product.handle}`,
          lastModified: updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    })
  } catch {
    // Skip products if backend is unreachable.
  }

  return entries
}
