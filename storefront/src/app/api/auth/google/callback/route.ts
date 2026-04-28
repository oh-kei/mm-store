import { NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/login?error=" + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  try {
    // In Medusa 2.0, the backend endpoint for processing the callback
    // POST /auth/customer/google/callback
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // We send a POST request to the backend with the code and state
    const response = await fetch(`${backendUrl}/auth/customer/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        state
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Auth callback failed:", errorData)
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
    }

    const data = await response.json()
    
    // Create the response object that redirects to account page
    const redirectResponse = NextResponse.redirect(new URL("/account", request.url))
    
    // The backend should return a JWT or set a cookie. 
    // If it returns a token in the response data, we need to set it as a cookie in the storefront.
    if (data.token) {
      redirectResponse.cookies.set("_medusa_jwt", data.token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      })
    }

    // Also forward any Set-Cookie headers from the backend response
    const setCookieHeader = response.headers.get("set-cookie")
    if (setCookieHeader) {
      redirectResponse.headers.append("Set-Cookie", setCookieHeader)
    }

    return redirectResponse
  } catch (err) {
    console.error("Callback error:", err)
    return NextResponse.redirect(new URL("/login?error=internal_error", request.url))
  }
}
