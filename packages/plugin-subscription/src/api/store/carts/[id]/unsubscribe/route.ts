import {
  MedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules
} from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

/**
 * Endpoint to remove subscription metadata from a cart.
 * This effectively converts the cart back to a one-time purchase.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const cartModule: ICartModuleService = req.scope.resolve(Modules.CART)

  const { data: [cart] } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "metadata"
    ],
    filters: {
      id: [req.params.id]
    }
  })

  if (!cart) {
    res.status(404).json({ message: "Cart not found" })
    return
  }

  // Filter out subscription-related metadata
  const newMetadata = { ...(cart.metadata || {}) }
  delete newMetadata.subscription_interval
  delete newMetadata.subscription_period

  // Update the cart using the cart module
  await cartModule.updateCarts([
    {
      id: cart.id,
      metadata: newMetadata
    }
  ])

  res.json({
    success: true,
    message: "Subscription data removed from cart"
  })
}
