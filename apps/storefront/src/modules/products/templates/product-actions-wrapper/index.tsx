import { getProductsById } from "@lib/data/products"
import { retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 * Also passes current cart quantity for Stack and Save tier calculation.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, cart] = await Promise.all([
    getProductsById({ ids: [id], regionId: region.id }).then((r) => r[0]),
    retrieveCart(),
  ])

  if (!product) {
    return null
  }

  const cartQuantity =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0

  return (
    <ProductActions
      product={product}
      region={region}
      cartQuantity={cartQuantity}
    />
  )
}
