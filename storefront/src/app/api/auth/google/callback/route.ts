import { NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  // Determine the base URL for redirects to avoid localhost issues
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (request.headers.get("x-forwarded-proto") ? 
                    `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}` : 
                    url.origin)

  if (error) {
    console.error("Google Auth Error from Provider:", error)
    return NextResponse.redirect(new URL("/login?error=" + error, baseUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", baseUrl))
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    console.log("Processing Google Auth callback for code:", code.substring(0, 5) + "...")

    const response = await fetch(`${backendUrl}/auth/customer/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      },
      body: JSON.stringify({
        code,
        state
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Auth callback failed at Backend. Status:", response.status, "Error:", errorText)
      return NextResponse.redirect(new URL("/login?error=auth_failed", baseUrl))
    }

    const data = await response.json()
    console.log("Auth successful, received data for user:", data.user?.email)
    
    const redirectResponse = NextResponse.redirect(new URL("/account", baseUrl))
    
    if (data.token) {
      redirectResponse.cookies.set("_medusa_jwt", data.token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      })
    }

    const setCookieHeader = response.headers.get("set-cookie")
    if (setCookieHeader) {
      redirectResponse.headers.append("Set-Cookie", setCookieHeader)
    }

    return redirectResponse
  } catch (err) {
    console.error("Internal Callback Error:", err)
    return NextResponse.redirect(new URL("/login?error=internal_error", baseUrl))
  }
}
