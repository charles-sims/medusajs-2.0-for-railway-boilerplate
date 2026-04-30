import { toast } from "@medusajs/ui"
import { sdk } from "../lib/sdk"
import { PreorderVariantResponse, CreatePreorderVariantData } from "../lib/types"
import { HttpTypes } from "@medusajs/framework/types"
import { useState, useEffect, useCallback } from "react"

export const usePreorderVariant = (variant: HttpTypes.AdminProductVariant) => {
  const [data, setData] = useState<PreorderVariantResponse | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUpserting, setIsUpserting] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)

  const fetchVariant = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await sdk.admin.product.retrieveVariant(
        variant.product_id!,
        variant.id,
        { fields: "*preorder_variant" }
      )
      setData(result as PreorderVariantResponse)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [variant.product_id, variant.id])

  useEffect(() => {
    fetchVariant()
  }, [fetchVariant])

  const upsertPreorder = useCallback(async (upsertData: CreatePreorderVariantData) => {
    setIsUpserting(true)
    try {
      await sdk.client.fetch(`/admin/variants/${variant.id}/preorders`, {
        method: "POST",
        body: upsertData,
      })
      await fetchVariant()
      toast.success("Preorder configuration saved successfully")
    } catch (err) {
      toast.error(`Failed to save preorder configuration: ${(err as Error).message}`)
    } finally {
      setIsUpserting(false)
    }
  }, [variant.id, fetchVariant])

  const disablePreorder = useCallback(async () => {
    setIsDisabling(true)
    try {
      await sdk.client.fetch(`/admin/variants/${variant.id}/preorders`, {
        method: "DELETE",
      })
      await fetchVariant()
      toast.success("Preorder configuration removed successfully")
    } catch (err) {
      toast.error(`Failed to remove preorder configuration: ${(err as Error).message}`)
    } finally {
      setIsDisabling(false)
    }
  }, [variant.id, fetchVariant])

  return {
    preorderVariant: data?.variant.preorder_variant?.status === "enabled" ?
      data.variant.preorder_variant : null,
    isLoading,
    error,
    upsertPreorder,
    disablePreorder,
    isUpserting,
    isDisabling,
  }
}
