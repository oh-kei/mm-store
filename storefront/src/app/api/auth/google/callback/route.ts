import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.redirect(new URL("/login?error=" + error, req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    // Exchange the code for a token using the Medusa SDK
    // This will also set the authentication cookies because we are on the same domain as the storefront
    const { token } = await sdk.auth.fetchToken("google", {
      code,
      state: state || "",
    })

    if (!token) {
      throw new Error("No token returned from Medusa")
    }

    // Redirect to the account page or the success_url if provided in state
    // In many cases, success_url is encoded in the state or we can just go to /account
    return NextResponse.redirect(new URL("/account", req.url))
  } catch (err: any) {
    console.error("Callback processing error:", err)
    return NextResponse.redirect(new URL("/login?error=callback_failed", req.url))
  }
}
