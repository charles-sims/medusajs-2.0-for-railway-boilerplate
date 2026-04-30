import { sdk } from "../lib/sdk"
import { Preorder, PreordersResponse } from "../lib/types"
import { useState, useEffect, useCallback } from "react"

export const usePreorders = (orderId: string) => {
  const [data, setData] = useState<PreordersResponse | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreorders = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await sdk.client.fetch(`/admin/orders/${orderId}/preorders`)
      setData(result as PreordersResponse)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchPreorders()
  }, [fetchPreorders])

  return {
    preorders: data?.preorders || [],
    isLoading,
    error,
  }
}

export type { Preorder }
