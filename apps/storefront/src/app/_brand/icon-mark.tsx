import { ImageResponse } from "next/og"

const SALT = "#F4F2EC"
const IRON = "#1F2326"

async function loadFraunces(text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    "Fraunces:opsz,wght@9..144,400"
  )}&text=${encodeURIComponent(text)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const css = await res.text()
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\('(?:opentype|truetype)'\)/
  )
  if (!match) return null
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) return null
  return fontRes.arrayBuffer()
}

export async function renderIconMark(size: number, fontSize: number) {
  let fraunces: ArrayBuffer | null = null
  try {
    fraunces = await loadFraunces("c")
  } catch {
    // fall back to satori default serif
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SALT,
          color: IRON,
          fontFamily: "Fraunces, serif",
          fontSize,
          // Optical-center 'c' against the square frame.
          paddingTop: Math.round(fontSize * 0.04),
        }}
      >
        c
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: fraunces
        ? [
            {
              name: "Fraunces",
              data: fraunces,
              style: "normal",
              weight: 400,
            },
          ]
        : undefined,
    }
  )
}
