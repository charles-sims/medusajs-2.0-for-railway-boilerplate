import { clx } from "@medusajs/ui"

import {
  RUO_DISCLAIMER_LONG,
  RUO_DISCLAIMER_SHORT,
} from "@lib/ruo"

type RUODisclaimerVariant = "inline" | "short" | "long"

type RUODisclaimerProps = {
  variant?: RUODisclaimerVariant
  className?: string
}

const variantStyles: Record<RUODisclaimerVariant, string> = {
  inline:
    "text-xs uppercase tracking-wide text-ui-fg-muted",
  short:
    "text-xs text-ui-fg-subtle bg-ui-bg-subtle border border-ui-border-base rounded-md px-3 py-2",
  long:
    "text-xs leading-relaxed text-ui-fg-subtle border-t border-ui-border-base pt-4",
}

const RUODisclaimer = ({
  variant = "short",
  className,
}: RUODisclaimerProps) => {
  const copy = variant === "long" ? RUO_DISCLAIMER_LONG : RUO_DISCLAIMER_SHORT

  return (
    <p
      role="note"
      aria-label="Research use only disclaimer"
      data-ruo-disclaimer={variant}
      className={clx(variantStyles[variant], className)}
    >
      {copy}
    </p>
  )
}

export default RUODisclaimer
