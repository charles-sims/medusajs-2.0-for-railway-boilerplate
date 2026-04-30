import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  hideSubtitle,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  hideSubtitle?: boolean
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) return null

  const { cheapestPrice } = getProductPrice({ product: pricedProduct })
  const subtitle = product.subtitle?.trim()

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div className="border border-calilean-sand rounded-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="square"
          isFeatured={isFeatured}
        />
        <div className="p-4">
          {!hideSubtitle && subtitle && (
            <p
              className="text-xs uppercase tracking-wider text-calilean-fog mb-1"
              data-testid="product-subtitle"
            >
              {subtitle}
            </p>
          )}
          <h3 className="text-base font-semibold text-calilean-ink" data-testid="product-title">
            {product.title}
          </h3>
          <div className="mt-1">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
