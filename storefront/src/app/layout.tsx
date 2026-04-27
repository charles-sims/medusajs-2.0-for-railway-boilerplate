import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google"
import "styles/globals.css"
import AgeGate from "@modules/calilean/components/age-gate"
import JsonLd from "@modules/common/components/json-ld"

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

const SITE_NAME = "CaliLean"
const SITE_TITLE = "CaliLean — Peptides, Made Plain"
const SITE_DESCRIPTION =
  "Clinically formulated peptides for the South Bay athlete — recovery, leanness, longevity. Third-party assayed. Built local."

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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-c.svg", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#1F2326",
      },
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
  themeColor: "#3A5A6A",
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CaliLean",
  legalName: "CaliLean",
  url: getBaseURL(),
  logo: `${getBaseURL().replace(/\/$/, "")}/favicon-c.svg`,
  sameAs: [],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const fontVars = `${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`

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
