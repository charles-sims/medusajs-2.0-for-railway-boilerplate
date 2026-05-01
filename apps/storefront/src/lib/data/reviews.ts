import { sdk } from "@lib/config"
import { StoreProductReview } from "../../types/reviews"

export const getProductReviews = async ({
  productId,
  limit = 10,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number
}) => {
  return sdk.client.fetch<{
    reviews: StoreProductReview[]
    average_rating: number
    limit: number
    offset: number
    count: number
  }>(`/store/products/${productId}/reviews`, {
    query: {
      limit,
      offset,
      order: "-created_at",
    },
  })
}

export const addProductReview = async (input: {
  title?: string
  content: string
  first_name: string
  last_name: string
  rating: number
  product_id: string
}) => {
  return sdk.client.fetch(`/store/reviews`, {
    method: "POST",
    body: input,
  })
}
