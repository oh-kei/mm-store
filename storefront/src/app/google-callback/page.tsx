"use client"

import { HttpTypes } from "@medusajs/types"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"

function GoogleCallbackInner() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()

  useEffect(() => {
    if (!loading) return

    const queryParams = Object.fromEntries(searchParams.entries())
    const error = queryParams["error"]

    if (error) {
      window.location.href = "/account?error=" + encodeURIComponent(error)
      return
    }

    const validateCallback = async () => {
      try {
        // Step 1: Exchange Google code for a Medusa JWT (client-side SDK call)
        const token = await sdk.auth.callback("customer", "google", queryParams)

        // Step 2: Decode to check if this is a brand-new customer
        const decoded = decodeToken(token) as {
          actor_id: string
          user_metadata: Record<string, unknown>
        }

        // Extract profile fields Google provides in the JWT user_metadata
        const meta = decoded?.user_metadata ?? {}
        const email = meta?.email as string | undefined
        const firstName = (meta?.given_name ?? meta?.first_name ?? "") as string
        const lastName = (meta?.family_name ?? meta?.last_name ?? "") as string

        if (decoded?.actor_id === "") {
          // Step 3a: Register the new customer in Medusa with full name from Google
          if (email) {
            try {
              await sdk.store.customer.create({
                email,
                first_name: firstName || undefined,
                last_name: lastName || undefined,
              })
            } catch (createErr: any) {
              // This email already has an emailpass account — tell the user clearly
              const msg = createErr?.toString() ?? ""
              if (msg.includes("already exists") || msg.includes("409")) {
                window.location.href = "/account?error=account_exists"
                return
              }
              throw createErr
            }
          }
          // Step 3b: Refresh token so actor_id is populated
          await sdk.auth.refresh()
        } else if (firstName || lastName) {
          // Existing Google customer — update their name if it's missing in Medusa
          try {
            const { customer: existing } = await sdk.store.customer.retrieve()
            if (!existing.first_name && !existing.last_name) {
              await sdk.store.customer.update({
                first_name: firstName || undefined,
                last_name: lastName || undefined,
              })
            }
          } catch {
            // Non-fatal: name update failure shouldn't block login
          }
        }

        // Step 4: Persist the token in the httpOnly _medusa_jwt cookie so the
        // server-side getAuthHeaders() can find it after the page navigates away.
        // (The SDK holds the token in-memory only — it's lost on full navigation.)
        const persistRes = await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!persistRes.ok) {
          throw new Error("Failed to persist auth token")
        }

        // Step 5: Confirm login succeeded
        const { customer: customerData } = await sdk.store.customer.retrieve()
        setCustomer(customerData)
        setLoading(false)
      } catch (err: any) {
        console.error("[Google Auth] Callback failed:", err)
        window.location.href = "/account?error=callback_failed"
      }
    }

    validateCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (!customer) return
    // Navigate to account — the _medusa_jwt cookie is now set so the server
    // will recognise the session correctly
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
