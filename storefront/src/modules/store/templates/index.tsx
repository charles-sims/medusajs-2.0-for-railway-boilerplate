import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategorizedProducts from "./categorized-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  return (
    <div className="py-12">
      <div className="content-container">
        <div className="text-center mb-16">
          <h1
            className="font-display text-3xl small:text-4xl font-normal"
            data-testid="store-page-title"
          >
            The lineup.
          </h1>
          <p className="text-calilean-fog mt-3">
            Organized by research pathway. Every vial batch-tested.
          </p>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <CategorizedProducts countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
