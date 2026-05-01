import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RatingSummary from "@modules/products/components/rating-summary"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const meta = (product.metadata || {}) as Record<string, string>
  const subtitle = product.subtitle?.trim()

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm text-calilean-fog hover:text-calilean-ink transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        {subtitle && (
          <p
            className="text-xs uppercase tracking-wider text-calilean-fog -mb-2"
            data-testid="product-subtitle"
          >
            {subtitle}
          </p>
        )}
        <h1
          className="text-4xl small:text-5xl font-bold tracking-tight"
          data-testid="product-title"
        >
          {product.title}
        </h1>

        <RatingSummary productId={product.id} />

        {(meta.batch || meta.report || meta.purity) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {meta.batch && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-calilean-ink px-3 py-1.5 rounded-lg text-sm font-medium">
                Batch # {meta.batch}
              </span>
            )}
            {meta.report && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-calilean-ink px-3 py-1.5 rounded-lg text-sm font-medium">
                Report # {meta.report}
              </span>
            )}
            {meta.purity && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-calilean-ink px-3 py-1.5 rounded-lg text-sm font-medium">
                Tested at {meta.purity}
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p
            className="text-base text-calilean-fog leading-relaxed whitespace-pre-line"
            data-testid="product-description"
          >
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
