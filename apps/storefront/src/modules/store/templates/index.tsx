import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import CategorizedProducts from "./categorized-products"
import ViewToggle from "./view-toggle"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  view,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  view?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const activeView = view === "all" ? "all" : "pathway"

  return (
    <div className="py-12">
      <div className="content-container">
        <div className="text-center mb-12">
          <h1
            className="font-display text-3xl small:text-4xl font-normal"
            data-testid="store-page-title"
          >
            The lineup.
          </h1>
          <p className="text-calilean-fog mt-3">
            Eight research-grade compounds. Every vial batch-tested.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <ViewToggle active={activeView} />
        </div>

        {activeView === "pathway" ? (
          <Suspense fallback={<SkeletonProductGrid />}>
            <CategorizedProducts countryCode={countryCode} />
          </Suspense>
        ) : (
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
        )}
      </div>
    </div>
  )
}

export default StoreTemplate
