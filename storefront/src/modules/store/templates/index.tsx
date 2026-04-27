import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="py-12">
      <div className="content-container">
        <div className="text-center mb-12">
          <h1 className="text-3xl small:text-4xl font-bold" data-testid="store-page-title">
            The lineup.
          </h1>
          <p className="text-calilean-fog mt-2">
            Seven launch SKUs across Repair, GH Axis, and Longevity. Catalog SKUs below. Each ships with a published COA.
          </p>
        </div>
        <div className="flex flex-col small:flex-row small:items-start gap-8">
          <RefinementList sortBy={sort} />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
