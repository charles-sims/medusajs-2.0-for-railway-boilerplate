import { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL().replace(/\/$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/_next/", "/api/", "/*?ruo=*"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
