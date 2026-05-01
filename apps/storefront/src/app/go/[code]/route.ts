import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://calilean.com"

/**
 * GET /go/:code
 *
 * Public QR-code redirect handler on the storefront domain.
 * Calls the Medusa backend to resolve the campaign, then 302-redirects
 * the visitor to the destination URL with UTM parameters.
 *
 * This keeps the admin domain hidden — QR codes point to
 * calilean.com/go/[code] instead of admin.calilean.com/go/[code].
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/go/${encodeURIComponent(code)}`, {
      // No caching — each scan should be counted
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!res.ok) {
      // Campaign not found or inactive — send to homepage
      return NextResponse.redirect(STOREFRONT_URL, 302)
    }

    const data = await res.json()

    if (!data.redirect_url) {
      return NextResponse.redirect(STOREFRONT_URL, 302)
    }

    return NextResponse.redirect(data.redirect_url, 302)
  } catch {
    // Backend unreachable — graceful fallback to homepage
    return NextResponse.redirect(STOREFRONT_URL, 302)
  }
}
