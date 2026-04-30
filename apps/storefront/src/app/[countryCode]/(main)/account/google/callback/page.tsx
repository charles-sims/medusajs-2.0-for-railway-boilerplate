"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { sdk } from "@lib/config"

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const queryParams = Object.fromEntries(searchParams.entries())
        const token = await sdk.auth.callback("customer", "google", queryParams)

        if (typeof token === "string") {
          // Authentication successful, redirect to account
          router.push("/account")
          return
        }

        setError("Authentication failed. Please try again.")
      } catch (err) {
        setError("Authentication failed. Please try again.")
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-ui-fg-error mb-4">{error}</p>
        <Link href="/account" className="underline text-ui-fg-interactive">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-ui-fg-subtle">Completing sign in...</p>
    </div>
  )
}
