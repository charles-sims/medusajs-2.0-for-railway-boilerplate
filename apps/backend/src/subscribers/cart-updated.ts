import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { applyStackDiscountWorkflow } from "../workflows/apply-stack-discount"

/**
 * Listens to cart.updated events and applies the correct
 * Stack and Save volume discount based on total cart quantity.
 *
 * Tiers:
 *   4-5 items  → STACK10 (10% off)
 *   6-9 items  → STACK15 (15% off)
 *   10+ items  → STACK20 (20% off)
 */
export default async function cartUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await applyStackDiscountWorkflow(container).run({
      input: { cart_id: data.id },
    })
  } catch (error) {
    // Don't block cart operations if discount logic fails
    console.error("Stack discount error:", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
