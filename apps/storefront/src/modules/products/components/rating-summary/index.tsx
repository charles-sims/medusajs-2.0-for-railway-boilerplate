"use client"

import { Star, StarSolid } from "@medusajs/icons"
import { getProductReviews } from "@lib/data/reviews"
import { useEffect, useState } from "react"

type RatingSummaryProps = {
  productId: string
}

const RatingSummary = ({ productId }: RatingSummaryProps) => {
  const [rating, setRating] = useState(0)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getProductReviews({ productId, limit: 1, offset: 0 })
      .then(({ average_rating, count }) => {
        setRating(Math.round(average_rating))
        setCount(count)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [productId])

  if (!loaded || count === 0) return null

  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-x-2 group"
      aria-label={`${rating} out of 5 stars, ${count} reviews`}
    >
      <div className="flex gap-x-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < rating ? (
              <StarSolid className="text-ui-tag-orange-icon" />
            ) : (
              <Star className="text-ui-fg-muted" />
            )}
          </span>
        ))}
      </div>
      <span className="text-sm text-calilean-fog group-hover:text-calilean-ink transition-colors">
        {count} {count === 1 ? "review" : "reviews"}
      </span>
    </a>
  )
}

export default RatingSummary
