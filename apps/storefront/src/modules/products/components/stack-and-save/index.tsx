"use client"

import { clx } from "@medusajs/ui"

const TIERS = [
  { min: 4, max: 5, discount: 10, label: "4–5 Vials" },
  { min: 6, max: 9, discount: 15, label: "6–9 Vials" },
  { min: 10, max: Infinity, discount: 20, label: "10+ Vials" },
] as const

type StackAndSaveProps = {
  quantity: number
  unitPrice?: number
}

export default function StackAndSave({
  quantity,
  unitPrice,
}: StackAndSaveProps) {
  const activeTier = TIERS.find(
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
        {TIERS.map((tier) => {
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
                {/* Status indicator */}
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
                {isActive && unitPrice != null && unitPrice > 0 && (
                  <span className="text-xs text-calilean-fog tabular-nums">
                    (${(unitPrice * (1 - tier.discount / 100)).toFixed(2)}/ea)
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
