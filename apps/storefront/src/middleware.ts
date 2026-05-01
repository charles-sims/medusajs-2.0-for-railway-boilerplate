import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
    }).then((res) => res.json())

    if (!regions?.length) {
      notFound()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Auth gate: redirect unauthenticated users to /gate ---
  const isPublicRoute =
    pathname === "/gate" ||
    pathname.startsWith("/gate/") ||
    pathname === "/reset-password" ||
    pathname.startsWith("/reset-password/") ||
    pathname.startsWith("/go/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/site.webmanifest" ||
    /\.\w+$/.test(pathname)

  if (!isPublicRoute) {
    const authToken = request.cookies.get("_medusa_jwt")
    if (!authToken?.value) {
      const gateUrl = new URL("/gate", request.url)
      // Preserve the original path + query (including UTM params) so the
      // gate page can redirect back after authentication.
      const returnTo = request.nextUrl.pathname + request.nextUrl.search
      if (returnTo && returnTo !== "/") {
        gateUrl.searchParams.set("redirect", returnTo)
      }
      return NextResponse.redirect(gateUrl)
    }
  }

  // If on gate page and already authenticated, redirect to intended destination
  if (pathname === "/gate" || pathname.startsWith("/gate/")) {
    const authToken = request.cookies.get("_medusa_jwt")
    if (authToken?.value) {
      const redirectTo = request.nextUrl.searchParams.get("redirect") || "/"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return NextResponse.next()
  }

  // Reset password page — skip region redirect
  if (
    pathname === "/reset-password" ||
    pathname.startsWith("/reset-password/")
  ) {
    return NextResponse.next()
  }

  // QR redirect routes — handled by the /go/[code] route handler directly,
  // skip region detection and country-code prefixing
  if (pathname.startsWith("/go/")) {
    return NextResponse.next()
  }
  // --- End auth gate ---

  // --- UTM Attribution capture ---
  const utmSource = request.nextUrl.searchParams.get("utm_source")
  if (utmSource && !request.cookies.get("__cl_attribution")) {
    const attribution = JSON.stringify({
      source: utmSource,
      medium: request.nextUrl.searchParams.get("utm_medium") || "",
      campaign: request.nextUrl.searchParams.get("utm_campaign") || "",
      content: request.nextUrl.searchParams.get("utm_content") || "",
      campaign_code: request.nextUrl.searchParams.get("qr_code") || "",
      landed_at: new Date().toISOString(),
    })
    request.headers.set("x-cl-attribution", attribution)
  }
  // --- End UTM Attribution ---

  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  const regionMap = await getRegionMap()

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // check if one of the country codes is in the url
  if (
    urlHasCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    redirectUrl = `${redirectUrl}&step=address`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  // Attach attribution cookie if captured
  const pendingAttribution = request.headers.get("x-cl-attribution")
  if (pendingAttribution) {
    response.cookies.set("__cl_attribution", pendingAttribution, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  // SEO routes (sitemap/robots/manifest) and static assets bypass region detection
  // so they stay reachable even if the Medusa backend is briefly unreachable.
  matcher: [
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|site.webmanifest|opengraph-image.jpg|twitter-image.jpg|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)",
  ],
}
