import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "styles/globals.css"
import AgeGate from "@modules/calilean/components/age-gate"
import JsonLd from "@modules/common/components/json-ld"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

const SITE_NAME = "CaliLean"
const SITE_TITLE = "CaliLean — Peptides, on the record"
const SITE_DESCRIPTION =
  "Research-grade peptides for the South Bay athlete — recovery, leanness, longevity. Independently tested, batch by batch. Every COA published."

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    url: getBaseURL(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: "#7090AB",
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CaliLean",
  legalName: "CaliLean",
  url: getBaseURL(),
  logo: `${getBaseURL().replace(/\/$/, "")}/brand/logo/calilean-logo-black.png`,
  sameAs: [],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const fontVars = `${plusJakarta.variable} ${jetbrainsMono.variable}`

  return (
    <html lang="en" data-mode="light" className={fontVars}>
      <body className="bg-calilean-bg text-calilean-ink font-sans">
        <JsonLd data={organizationJsonLd} />
        <AgeGate />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
