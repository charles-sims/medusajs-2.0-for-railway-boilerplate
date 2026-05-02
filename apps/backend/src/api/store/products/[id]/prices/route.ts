import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Use Query to fetch variants with their linked prices in one go
  const { data: variants } = await query.graph({
    entity: "product_variant",
    filters: { product_id: productId },
    fields: ["id", "title", "price_set.prices.*"],
  })

  const result = (variants || []).map((v: any) => ({
    id: v.id,
    title: v.title || "",
    prices: (v.price_set?.prices || []).map((p: any) => ({
      amount: p.amount,
      currency_code: p.currency_code,
      min_quantity: p.min_quantity,
      max_quantity: p.max_quantity,
    })),
  }))

  res.json({ variants: result })
}
