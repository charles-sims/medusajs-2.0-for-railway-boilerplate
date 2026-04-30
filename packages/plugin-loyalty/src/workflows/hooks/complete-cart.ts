import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { getCartLoyaltyPromotion } from "../../utils/promo"
import { MedusaError } from "@medusajs/framework/utils"
import { CartData } from "../../utils/promo"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve("query") as {
    graph: (args: any) => Promise<{ data: any[] }>
  }

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "promotions.*",
      "promotions.rules.*",
      "promotions.rules.values.*",
      "promotions.application_method.*",
      "customer.*",
    ],
    filters: { id: cart.id },
  })

  const fullCart = carts[0] as unknown as CartData
  const loyaltyPromo = getCartLoyaltyPromotion(fullCart)

  if (!loyaltyPromo || !fullCart.customer?.id) return

  const LOYALTY_POINT_MODULE = "loyaltyModuleService"
  const loyaltyService = container.resolve(LOYALTY_POINT_MODULE) as {
    getPoints: (customerId: string) => Promise<number>
  }
  const customerPoints = await loyaltyService.getPoints(fullCart.customer.id)
  const requiredPoints = loyaltyPromo.application_method?.value || 0

  if (customerPoints < requiredPoints) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Insufficient loyalty points. You have ${customerPoints} but need ${requiredPoints}.`
    )
  }
})
