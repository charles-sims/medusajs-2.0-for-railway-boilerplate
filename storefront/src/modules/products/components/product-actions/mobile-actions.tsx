import { Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  inStock,
  handleAddToCart,
  isAdding,
  show,
}) => {
  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  return (
    <div
      className={clx("lg:hidden inset-x-0 bottom-0 fixed", {
        "pointer-events-none": !show,
      })}
    >
      <Transition
        as={Fragment}
        show={show}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="bg-calilean-bg flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full border-t border-calilean-fog/30"
          data-testid="mobile-actions"
        >
          <div className="flex items-center gap-x-2">
            <span data-testid="mobile-title">{product.title}</span>
            <span>—</span>
            {selectedPrice ? (
              <div className="flex items-end gap-x-2 text-ui-fg-base">
                {selectedPrice.price_type === "sale" && (
                  <p>
                    <span className="line-through text-small-regular">
                      {selectedPrice.original_price}
                    </span>
                  </p>
                )}
                <span
                  className={clx({
                    "text-ui-fg-interactive":
                      selectedPrice.price_type === "sale",
                  })}
                >
                  {selectedPrice.calculated_price}
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !variant}
            className="w-full"
            isLoading={isAdding}
            data-testid="mobile-cart-button"
          >
            {!variant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : "Add to cart"}
          </Button>
        </div>
      </Transition>
    </div>
  )
}

export default MobileActions
