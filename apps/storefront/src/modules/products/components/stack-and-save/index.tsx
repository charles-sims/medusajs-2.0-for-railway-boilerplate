"use client"

import { clx } from "@medusajs/ui"

type PriceTier = {
  min_quantity: number | null
  max_quantity: number | null
  amount: number
  currency_code: string
}

type Tier = {
  min: number
  max: number
  discount: number
  label: string
  tierPrice: number
}

type StackAndSaveProps = {
  quantity: number
  prices?: PriceTier[]
}

function buildTiers(prices: PriceTier[]): Tier[] {
  if (!prices?.length) return []

  // Base price = the one with no min_quantity (or min_quantity of 1/null)
  const basePrice = prices.find(
    (p) => p.min_quantity == null || p.min_quantity <= 1
  )
  if (!basePrice || basePrice.amount <= 0) return []

  // Quantity-tiered prices = those with min_quantity > 1
  const tieredPrices = prices
    .filter((p) => p.min_quantity != null && p.min_quantity > 1)
    .sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0))

  if (!tieredPrices.length) return []

  return tieredPrices.map((tp) => {
    const discount = Math.round(
      ((basePrice.amount - tp.amount) / basePrice.amount) * 100
    )
    const min = tp.min_quantity ?? 2
    const max = tp.max_quantity ?? Infinity
    const label =
      max === Infinity || max == null
        ? `${min}+ Vials`
        : `${min}–${max} Vials`

    return { min, max, discount, label, tierPrice: tp.amount }
  })
}

export default function StackAndSave({ quantity, prices }: StackAndSaveProps) {
  const tiers = buildTiers(prices ?? [])

  if (!tiers.length) return null

  const activeTier = tiers.find(
    (tier) => quantity >= tier.min && quantity <= tier.max
  )

  return (
    <div className="rounded-rounded border border-calilean-sand overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-calilean-ink">
        <span className="text-sm font-semibold text-white tracking-wide">
          Stack &amp; Save
        </span>
        {activeTier && (
          <span className="text-xs font-medium text-calilean-pacific">
            Saving {activeTier.discount}%
          </span>
        )}
      </div>

      {/* Tiers */}
      <div className="divide-y divide-calilean-sand">
        {tiers.map((tier) => {
          const isActive = quantity >= tier.min && quantity <= tier.max
          const isUnlocked = quantity >= tier.min

          return (
            <div
              key={tier.min}
              className={clx(
                "flex items-center justify-between px-4 py-3 transition-colors duration-200",
                {
                  "bg-calilean-pacific/[0.06]": isActive,
                  "bg-white": !isActive,
                }
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clx(
                    "w-2 h-2 rounded-full transition-colors duration-200",
                    {
                      "bg-calilean-pacific": isActive,
                      "bg-calilean-ink/20": isUnlocked && !isActive,
                      "bg-calilean-sand": !isUnlocked,
                    }
                  )}
                />
                <span
                  className={clx("text-sm", {
                    "text-calilean-ink font-medium": isActive,
                    "text-calilean-fog": !isActive,
                  })}
                >
                  Add {tier.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={clx("text-sm font-semibold tabular-nums", {
                    "text-calilean-pacific": isActive,
                    "text-calilean-ink": !isActive && isUnlocked,
                    "text-calilean-fog": !isUnlocked,
                  })}
                >
                  {tier.discount}% off
                </span>
                {isActive && (
                  <span className="text-xs text-calilean-fog tabular-nums">
                    (${tier.tierPrice.toFixed(2)}/ea)
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
