import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import AgeGate from "@modules/bluum/components/age-gate"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Bluum Peptides | Research-Grade Peptides",
  description: "USA-based supplier of high-purity peptides for advanced research and development.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className="bg-bluum-bg text-bluum-text">
        <AgeGate />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
