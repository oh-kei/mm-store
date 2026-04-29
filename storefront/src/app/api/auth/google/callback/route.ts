import { NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const error = url.searchParams.get("error")

  // Determine the base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (request.headers.get("x-forwarded-proto") ? 
                    `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}` : 
                    url.origin)

  if (error) {
    console.error("Auth Error:", error)
    return NextResponse.redirect(new URL("/login?error=" + error, baseUrl))
  }

  // If the backend has finished the Google flow and sent us a token
  if (token) {
    console.log("Received auth token from backend, logging in...")
    
    const redirectResponse = NextResponse.redirect(new URL("/account", baseUrl))
    
    // Set the JWT token in the storefront's cookie
    redirectResponse.cookies.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })

    return redirectResponse
  }

  // If we got here without a token or error, something went wrong
  console.error("No token received in callback")
  return NextResponse.redirect(new URL("/login?error=auth_failed", baseUrl))
}
