import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import LabBanner from "@modules/calilean/components/lab-banner"
import ValueProps from "@modules/calilean/components/value-props"
import FaqAccordion from "@modules/calilean/components/faq-accordion"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

const HOME_TITLE = "Peptides for the South Bay athlete | CaliLean"
const HOME_DESCRIPTION =
  "Research-grade peptides for the South Bay athlete — recovery, leanness, longevity. Independently tested, batch by batch. Every COA published."

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "CaliLean",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <LabBanner />
      <div className="py-12">
        <div className="content-container">
          <h2 className="text-3xl small:text-4xl font-bold text-center mb-4">Featured Peptides</h2>
        </div>
        <ul className="flex flex-col">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <ValueProps />
      <FaqAccordion />
    </>
  )
}
