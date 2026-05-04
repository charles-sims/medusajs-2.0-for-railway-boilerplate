import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/gate?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/gate?error=no_code", request.url))
  }

  try {
    // Exchange the code for a token
    const queryParams = Object.fromEntries(searchParams.entries())
    const token = await sdk.auth.callback("customer", "google", queryParams)

    if (typeof token === "string") {
      const response = NextResponse.redirect(new URL("/", request.url))
      
      // Set the Medusa JWT cookie so the middleware and hooks recognize the session
      response.cookies.set("_medusa_jwt", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    return NextResponse.redirect(new URL("/gate?error=auth_failed", request.url))
  } catch (err: any) {
    console.error("Google OAuth callback error:", err.message)
    return NextResponse.redirect(new URL("/gate?error=exception", request.url))
  }
}
