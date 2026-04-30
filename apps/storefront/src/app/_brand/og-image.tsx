import { ImageResponse } from "next/og"

// CaliLean OG/Twitter card — shared generator.
// Spec source: docs/brand/identity-brief.md §3 + §7 (Salt & Iron palette, Fraunces wordmark).
// Used by app/opengraph-image.tsx and app/twitter-image.tsx.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"
export const OG_ALT =
  "CaliLean — Peptides, on the record. South Bay, California."

const SALT = "#F4F2EC"
const IRON = "#1F2326"
const PACIFIC = "#3A5A6A"

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\('(?:opentype|truetype)'\)/
  )
  if (!match) throw new Error(`Failed to parse font URL for ${family}`)
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) throw new Error(`Failed to fetch font ${family}`)
  return fontRes.arrayBuffer()
}

export async function renderOgImage() {
  // Render text we'll display so Google returns a minimal subset.
  const wordmarkText = "calilean"
  const taglineText = "Peptides, on the record."
  const locationText = "south bay · california"
  const subset = Array.from(
    new Set((wordmarkText + taglineText + locationText).split(""))
  ).join("")

  let fraunces: ArrayBuffer | null = null
  let inter: ArrayBuffer | null = null
  try {
    ;[fraunces, inter] = await Promise.all([
      loadGoogleFont("Fraunces:opsz,wght@9..144,400", subset),
      loadGoogleFont("Inter:wght@400;500", subset),
    ])
  } catch {
    // Fall through with null fonts; satori will use its default fallback.
  }

  const fonts: Array<{
    name: string
    data: ArrayBuffer
    style: "normal"
    weight: 400 | 500
  }> = []
  if (fraunces) {
    fonts.push({
      name: "Fraunces",
      data: fraunces,
      style: "normal",
      weight: 400,
    })
  }
  if (inter) {
    fonts.push({ name: "Inter", data: inter, style: "normal", weight: 400 })
    fonts.push({ name: "Inter", data: inter, style: "normal", weight: 500 })
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: SALT,
          color: IRON,
          padding: "80px 96px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 192,
              letterSpacing: "0.01em",
              lineHeight: 1,
              color: IRON,
            }}
          >
            calilean
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              marginTop: 36,
              color: IRON,
              opacity: 0.78,
              letterSpacing: "0.01em",
            }}
          >
            Peptides, on the record.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 96,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: PACIFIC,
          }}
        >
          south bay · california
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 96,
            width: 56,
            height: 2,
            background: IRON,
            opacity: 0.6,
          }}
        />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  )
}
