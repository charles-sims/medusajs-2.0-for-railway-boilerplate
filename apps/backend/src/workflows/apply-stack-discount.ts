import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  validateStackDiscountStep,
  ValidateStackDiscountOutput,
} from "./steps/validate-stack-discount"

type ApplyStackDiscountInput = {
  cart_id: string
}

export const applyStackDiscountWorkflow = createWorkflow(
  "apply-stack-discount",
  function (input: ApplyStackDiscountInput) {
    // Fetch cart with items and current promotions
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "items.quantity",
        "promotions.code",
      ],
      filters: { id: input.cart_id },
    })

    const cart = transform({ carts }, ({ carts }) => carts[0])

    // Determine which promo code to apply/remove
    const validation = validateStackDiscountStep({ cart })

    // Build the final promo_codes array for the cart
    const promoCodes = transform(
      { cart, validation },
      ({
        cart,
        validation,
      }: {
        cart: { promotions?: Array<{ code?: string | null }> | null }
        validation: ValidateStackDiscountOutput
      }) => {
        // Start with existing codes, minus the ones to remove
        const removeSet = new Set(validation.codes_to_remove)
        const existing = (cart.promotions ?? [])
          .map((p) => p.code)
          .filter((c): c is string => c != null && !removeSet.has(c))

        // Add new code if needed
        if (validation.code_to_apply) {
          existing.push(validation.code_to_apply)
        }

        return existing
      }
    )

    // Only update if there are changes
    const hasChanges = transform(
      { validation },
      ({ validation }: { validation: ValidateStackDiscountOutput }) =>
        validation.code_to_apply !== null ||
        validation.codes_to_remove.length > 0
    )

    when({ hasChanges }, ({ hasChanges }) => hasChanges).then(() => {
      updateCartPromotionsWorkflow.runAsStep({
        input: {
          cart_id: input.cart_id,
          promo_codes: promoCodes,
        },
      })
    })

    return new WorkflowResponse(validation)
  }
)
