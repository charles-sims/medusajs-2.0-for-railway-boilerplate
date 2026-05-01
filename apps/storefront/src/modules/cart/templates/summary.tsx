"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import RUODisclaimer from "@modules/common/components/ruo-disclaimer"
import DiscountCode from "@modules/checkout/components/discount-code"
import StackAndSave from "@modules/products/components/stack-and-save"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const cartQuantity = cart.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  ) ?? 0

  // Extract variant prices (with quantity tiers) from the first cart item
  const firstVariant = cart.items?.[0]?.variant as any
  const variantPrices = firstVariant?.prices ?? firstVariant?.product?.variants?.find(
    (v: any) => v.id === cart.items?.[0]?.variant_id
  )?.prices

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <StackAndSave quantity={cartQuantity} prices={variantPrices} />
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <p className="text-xs text-calilean-fog text-center">
        By checking out you confirm this purchase is for research use only.
      </p>
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
      <RUODisclaimer variant="inline" />
    </div>
  )
}

export default Summary
