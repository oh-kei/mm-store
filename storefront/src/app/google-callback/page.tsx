"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { decodeToken } from "react-jwt"
import { sdk } from "@lib/config"

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  const validateCallback = async () => {
    // Check if Google returned an error
    const error = queryParams["error"]
    if (error) {
      setErrorMsg(error)
      window.location.href = "/login?error=" + encodeURIComponent(error)
      return
    }

    try {
      // Step 1: Exchange the code for a Medusa JWT.
      // Running client-side means the SDK stores the token in the browser session.
      const token = await sdk.auth.callback("customer", "google", queryParams)

      // Step 2: Decode the JWT to check if the customer already exists
      const decodedToken = decodeToken(token) as {
        actor_id: string
        user_metadata: Record<string, unknown>
      }

      const isNewCustomer = decodedToken?.actor_id === ""

      if (isNewCustomer) {
        // Step 3a: Register the new customer in Medusa
        const email = decodedToken.user_metadata?.email as string
        if (email) {
          await sdk.store.customer.create({ email })
        }
        // Step 3b: Refresh token so the new actor_id is populated
        await sdk.auth.refresh()
      }

      // Step 4: Retrieve the customer to confirm login succeeded
      const { customer: customerData } = await sdk.store.customer.retrieve()
      setCustomer(customerData)
      setLoading(false)
    } catch (err: any) {
      console.error("[Google Auth] Callback failed:", err)
      window.location.href = "/login?error=callback_failed"
    }
  }

  useEffect(() => {
    if (!loading) return
    validateCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (!customer) return
    window.location.href = "/account"
  }, [customer])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {loading && !errorMsg && (
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
      {errorMsg && (
        <span className="text-sm text-red-500">Authentication failed: {errorMsg}</span>
      )}
    </div>
  )
}
