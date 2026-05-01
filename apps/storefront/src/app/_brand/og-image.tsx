import { ImageResponse } from "next/og"

// CaliLean OG/Twitter card — shared generator.
// Three-font system: Instrument Serif (display), Plus Jakarta Sans (body), JetBrains Mono (data).

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"
export const OG_ALT =
  "Cali Lean — Peptides, plainly labeled. South Bay, California."

const BG = "#FFFFFF"
const INK = "#111111"
const PACIFIC = "#7090AB"
const FOG = "#9CA3A8"

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\('(?:opentype|truetype|woff2)'\)/
  )
  if (!match) throw new Error(`Failed to parse font URL for ${family}`)
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) throw new Error(`Failed to fetch font ${family}`)
  return fontRes.arrayBuffer()
}

export async function renderOgImage() {
  const displayText = "Peptides, plainly labeled."
  const locationText = "south bay · california"
  const subset = Array.from(
    new Set((displayText + locationText + "CaliLean").split(""))
  ).join("")

  let instrumentSerif: ArrayBuffer | null = null
  let plusJakarta: ArrayBuffer | null = null
  try {
    ;[instrumentSerif, plusJakarta] = await Promise.all([
      loadGoogleFont("Instrument+Serif", subset),
      loadGoogleFont("Plus+Jakarta+Sans:wght@500", subset),
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
  if (instrumentSerif) {
    fonts.push({
      name: "Instrument Serif",
      data: instrumentSerif,
      style: "normal",
      weight: 400,
    })
  }
  if (plusJakarta) {
    fonts.push({
      name: "Plus Jakarta Sans",
      data: plusJakarta,
      style: "normal",
      weight: 500,
    })
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: INK,
          padding: "80px 96px",
          position: "relative",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 80,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: INK,
            }}
          >
            Peptides, plainly labeled.
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              marginTop: 24,
              color: FOG,
              letterSpacing: "0.01em",
            }}
          >
            Recovery, leanness, longevity. Research-grade, built in the South
            Bay.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 96,
            fontSize: 16,
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
            width: 48,
            height: 2,
            background: PACIFIC,
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
