"use client"

import { clx } from "@medusajs/ui"

type QuantitySelectorProps = {
  quantity: number
  onChange: (quantity: number) => void
  maxQuantity?: number
  disabled?: boolean
}

export default function QuantitySelector({
  quantity,
  onChange,
  maxQuantity = 99,
  disabled = false,
}: QuantitySelectorProps) {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1)
  }

  const increment = () => {
    if (quantity < maxQuantity) onChange(quantity + 1)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Quantity</span>
      <div className="flex items-center h-10">
        <button
          onClick={decrement}
          disabled={disabled || quantity <= 1}
          className={clx(
            "w-10 h-10 flex items-center justify-center border border-ui-border-base rounded-l-rounded",
            "bg-ui-bg-subtle text-ui-fg-base transition-colors",
            "hover:bg-ui-bg-base disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          aria-label="Decrease quantity"
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
            <path d="M0 1H12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <div className="h-10 w-14 flex items-center justify-center border-y border-ui-border-base bg-ui-bg-subtle text-small-regular tabular-nums">
          {quantity}
        </div>
        <button
          onClick={increment}
          disabled={disabled || quantity >= maxQuantity}
          className={clx(
            "w-10 h-10 flex items-center justify-center border border-ui-border-base rounded-r-rounded",
            "bg-ui-bg-subtle text-ui-fg-base transition-colors",
            "hover:bg-ui-bg-base disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          aria-label="Increase quantity"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
