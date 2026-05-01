import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * Stack and Save volume discount tiers.
 * Based on TOTAL cart quantity (all items combined).
 */
const TIERS = [
  { min: 10, code: "STACK20" },
  { min: 6, code: "STACK15" },
  { min: 4, code: "STACK10" },
] as const

const STACK_CODES = new Set<string>(TIERS.map((t) => t.code))

export type ValidateStackDiscountInput = {
  cart: {
    items: Array<{ quantity: number }>
    promotions?: Array<{ code?: string | null }> | null
  }
}

export type ValidateStackDiscountOutput = {
  code_to_apply: string | null
  codes_to_remove: string[]
}

/**
 * Determines which Stack promotion to apply based on total cart quantity.
 * Returns the code to apply and any existing Stack codes to remove.
 */
export const validateStackDiscountStep = createStep(
  "validate-stack-discount",
  async (input: ValidateStackDiscountInput) => {
    const totalQty = input.cart.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    )

    // Find the matching tier
    const tier = TIERS.find((t) => totalQty >= t.min)
    const targetCode = tier?.code ?? null

    // Find existing stack promo codes on the cart
    const existingStackCodes = (input.cart.promotions ?? [])
      .map((p) => p.code)
      .filter((c): c is string => c != null && STACK_CODES.has(c))

    // If already has the correct code and no extras, skip
    if (
      targetCode &&
      existingStackCodes.length === 1 &&
      existingStackCodes[0] === targetCode
    ) {
      return new StepResponse({ code_to_apply: null, codes_to_remove: [] })
    }

    // Remove all existing stack codes that aren't the target
    const codesToRemove = existingStackCodes.filter((c) => c !== targetCode)

    // If target is already applied, only remove extras
    const alreadyApplied = targetCode && existingStackCodes.includes(targetCode)

    return new StepResponse({
      code_to_apply: alreadyApplied ? null : targetCode,
      codes_to_remove: codesToRemove,
    })
  }
)
