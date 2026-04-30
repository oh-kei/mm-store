"use client"

import { HttpTypes } from "@medusajs/types"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"

// Inner component that uses useSearchParams — must be wrapped in <Suspense>
function GoogleCallbackInner() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()

  useEffect(() => {
    if (!loading) return

    const queryParams = Object.fromEntries(searchParams.entries())
    const error = queryParams["error"]

    if (error) {
      window.location.href = "/login?error=" + encodeURIComponent(error)
      return
    }

    const validateCallback = async () => {
      try {
        // Step 1: Exchange the Google code for a Medusa JWT (runs client-side
        // so the SDK stores it in the browser session automatically)
        const token = await sdk.auth.callback("customer", "google", queryParams)

        // Step 2: Decode to check if this is a brand-new customer
        const decoded = decodeToken(token) as {
          actor_id: string
          user_metadata: Record<string, unknown>
        }

        if (decoded?.actor_id === "") {
          // Step 3a: Register the new customer in Medusa
          const email = decoded.user_metadata?.email as string
          if (email) {
            await sdk.store.customer.create({ email })
          }
          // Step 3b: Refresh token so actor_id is populated
          await sdk.auth.refresh()
        }

        // Step 4: Confirm login succeeded
        const { customer: customerData } = await sdk.store.customer.retrieve()
        setCustomer(customerData)
        setLoading(false)
      } catch (err: any) {
        console.error("[Google Auth] Callback failed:", err)
        window.location.href = "/login?error=callback_failed"
      }
    }

    validateCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (!customer) return
    window.location.href = "/account"
  }, [customer])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {loading && (
        <>
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Signing you in with Google…</span>
        </>
      )}
      {customer && (
        <span className="text-sm text-gray-500">
          Logged in as {customer.email}, redirecting…
        </span>
      )}
    </div>
  )
}

// Suspense boundary is required by Next.js App Router when using useSearchParams
export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading…</span>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  )
}
