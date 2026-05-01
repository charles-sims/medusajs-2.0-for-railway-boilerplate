import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "The Lineup | CaliLean",
  description:
    "Research-grade compounds across recovery, metabolic, longevity, and cosmetic pathways. Every vial batch-tested.",
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
    view?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page, view } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      view={view}
    />
  )
}
