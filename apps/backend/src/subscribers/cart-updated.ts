import { SubscriberConfig } from "@medusajs/medusa"

/**
 * Cart-updated subscriber.
 *
 * Stack & Save volume discounts are handled entirely by quantity-based
 * pricing on each variant (min_quantity / max_quantity price tiers).
 * No promotion workflow is needed here — Medusa's pricing engine
 * applies the correct tier price automatically.
 */
export default async function cartUpdatedHandler() {
  // noop — reserved for future cart-update hooks
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
