import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export async function renderIconMark(size: number, _fontSize?: number) {
  const faviconPath = join(process.cwd(), "public", "favicon-512.png")
  const faviconData = await readFile(faviconPath)
  const base64 = faviconData.toString("base64")
  const dataUrl = `data:image/png;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <img
          src={dataUrl}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { width: size, height: size }
  )
}
