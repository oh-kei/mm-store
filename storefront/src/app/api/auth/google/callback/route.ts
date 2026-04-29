import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const queryParams = Object.fromEntries(searchParams.entries())

  const error = searchParams.get("error")
  if (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.redirect(new URL("/login?error=" + error, req.nextUrl.origin))
  }

  try {
    // Official Medusa v2 Callback Flow
    const token = await sdk.auth.callback("customer", "google", queryParams)
    
    if (!token) {
      throw new Error("No token returned from Medusa")
    }

    // Decode token to check if it's a new customer
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
    
    if (payload.actor_id === "") {
      // New customer — create account and refresh
      // metadata contains email, name, etc.
      const email = payload.user_metadata?.email
      if (email) {
        await sdk.store.customer.create({ email })
        await sdk.auth.refresh()
      }
    }

    // Redirect to the account page
    // Using req.nextUrl.origin ensures we redirect to the correct public domain
    return NextResponse.redirect(new URL("/account", req.nextUrl.origin))
  } catch (err: any) {
    console.error("Callback processing error:", err)
    return NextResponse.redirect(new URL("/login?error=callback_failed", req.nextUrl.origin))
  }
}
