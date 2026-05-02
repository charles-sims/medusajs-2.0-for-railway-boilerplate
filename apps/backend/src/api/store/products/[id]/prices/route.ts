import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId } = req.params

  const pricingService = req.scope.resolve(Modules.PRICING)
  const productService = req.scope.resolve(Modules.PRODUCT)

  // Get all variants for this product
  const [variants] = await productService.listProductVariants(
    { product_id: productId },
    { select: ["id", "title"] }
  )

  if (!variants?.length) {
    res.json({ variants: [] })
    return
  }

  // Get price sets linked to these variants via the pricing module
  const query = req.scope.resolve("query")

  const variantPrices: Record<
    string,
    { id: string; title: string; prices: any[] }
  > = {}

  for (const variant of variants) {
    // Query the link between variant and price set
    const { data: links } = await query.graph({
      entity: "product_variant_price_set",
      filters: { variant_id: variant.id },
      fields: ["variant_id", "price_set_id"],
    })

    if (!links?.length) {
      variantPrices[variant.id] = {
        id: variant.id,
        title: variant.title || "",
        prices: [],
      }
      continue
    }

    const priceSetId = (links[0] as any).price_set_id
    const priceSet = await pricingService.retrievePriceSet(priceSetId, {
      relations: ["prices"],
    })

    variantPrices[variant.id] = {
      id: variant.id,
      title: variant.title || "",
      prices: (priceSet.prices || []).map((p: any) => ({
        amount: p.amount,
        currency_code: p.currency_code,
        min_quantity: p.min_quantity,
        max_quantity: p.max_quantity,
      })),
    }
  }

  res.json({ variants: Object.values(variantPrices) })
}
