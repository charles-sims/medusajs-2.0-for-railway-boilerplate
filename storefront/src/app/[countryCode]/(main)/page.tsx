import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import LabBanner from "@modules/calilean/components/lab-banner"
import ValueProps from "@modules/calilean/components/value-props"
import FaqAccordion from "@modules/calilean/components/faq-accordion"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Bluum Peptides | Research-Grade Peptides, Delivered",
  description: "USA-based supplier of high-purity peptides for advanced research and development. Buy online today.",
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
