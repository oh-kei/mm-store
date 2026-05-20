"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cache } from "react"
import { getAuthHeaders, removeAuthToken, setAuthToken, removeCartId, getCartId, setCartId } from "./cookies"
import { retrieveCart } from "./cart"

export const getCustomer = cache(async function () {
  return await sdk.store.customer
    .retrieve({}, { next: { tags: ["customer"] }, ...(await getAuthHeaders()) })
    .then(({ customer }) => customer)
    .catch(() => null)
})

export const updateCustomer = cache(async function (
  body: HttpTypes.StoreUpdateCustomer
) {
  const updateRes = await sdk.store.customer
    .update(body, {}, await getAuthHeaders())
    .then(({ customer }) => customer)
    .catch(medusaError)

  revalidateTag("customer")
  return updateRes
})

export async function mergeCartAfterSignIn(token: string) {
  const authHeaders = { authorization: `Bearer ${token}` }
  try {
    const guestCartId = await getCartId()
    let guestCart = null
    if (guestCartId) {
      guestCart = await retrieveCart()
    }

    const { customer } = await sdk.store.customer.retrieve({}, { headers: authHeaders })
    if (customer) {
      let customerCart = null
      try {
        const cartRes: any = await sdk.client.request(
          "GET",
          "/store/customer-cart",
          {},
          {},
          { ...authHeaders }
        )
        customerCart = cartRes.cart
      } catch (e) {
        console.error("Failed to fetch customer cart from custom endpoint:", e)
      }

      if (guestCart && guestCart.items && guestCart.items.length > 0) {
        if (customerCart) {
          console.log(`[mergeCartAfterSignIn] Appending guest cart items to customer cart: ${customerCart.id}`)
          for (const item of guestCart.items) {
            try {
              await sdk.store.cart.createLineItem(
                customerCart.id,
                {
                  variant_id: item.variant_id,
                  quantity: item.quantity,
                  metadata: item.metadata,
                },
                {},
                authHeaders
              )
            } catch (err) {
              console.error(`Failed to append item ${item.variant_id} to customer cart:`, err)
            }
          }
          await setCartId(customerCart.id)
        } else {
          console.log(`[mergeCartAfterSignIn] No existing customer cart. Associating guest cart ${guestCart.id} with customer.`)
          try {
            await sdk.store.cart.update(
              guestCart.id,
              { email: customer.email },
              {},
              authHeaders
            )
            await setCartId(guestCart.id)
          } catch (err) {
            console.error("Failed to associate guest cart with customer:", err)
          }
        }
      } else if (customerCart) {
        console.log(`[mergeCartAfterSignIn] No guest cart items. Using existing customer cart: ${customerCart.id}`)
        await setCartId(customerCart.id)
      }
    }
  } catch (error) {
    console.error("Error merging carts:", error)
  }
  revalidateTag("cart")
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const res: any = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })
    
    const token = typeof res === 'string' ? res : res.token || res.location

    if (!token || typeof token !== "string") {
      return "Registration failed, no token received."
    }

    const customHeaders = { authorization: `Bearer ${token}` }
    
    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginRes: any = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
    
    const loginToken = typeof loginRes === 'string' ? loginRes : loginRes.token || loginRes.location

    if (!loginToken || typeof loginToken !== "string") {
      return "Authentication failed, no token received."
    }

    await setAuthToken(loginToken)
    revalidateTag("customer")
    await mergeCartAfterSignIn(loginToken)
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error
    let msg = error.toString()
    if (msg.includes("already exists")) {
      return "An account with this email already exists."
    }
    if (msg.includes("400")) {
      return "Unable to create account. Please ensure your email is valid and your password is at least 8 characters long."
    }
    if (msg.includes("401")) {
      return "Your account was created, but we couldn't log you in automatically. Please sign in manually."
    }
    return "We encountered an unexpected error during registration. Please try again later."
  }
  
  redirect('/')
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const res: any = await sdk.auth.login("customer", "emailpass", { email, password })
    const token = typeof res === 'string' ? res : res.token || res.location
    
    if (!token || typeof token !== "string") {
      return "Authentication failed, no token received. Please try again."
    }

    if (token) {
      await setAuthToken(token)
      revalidateTag("customer")
      await mergeCartAfterSignIn(token)
    }
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error
    const msg = error.toString()
    if (msg.includes("401")) {
      return "Incorrect password."
    }
    return "Incorrect password."
  }

  redirect('/')
}

export async function signout(countryCode: string) {
  try {
    const cart = await retrieveCart()
    if (cart && cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await sdk.store.cart.deleteLineItem(cart.id, item.id, {}, await getAuthHeaders())
      }
    }
  } catch (e) {
    console.error("Failed to clear cart on signout:", e)
  }
  await sdk.auth.logout()
  await removeAuthToken()
  await removeCartId()
  revalidateTag("auth")
  revalidateTag("customer")
  revalidateTag("cart")
  return { success: true }
}

export const addCustomerAddress = async (
  _currentState: unknown,
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .createAddress(address, {}, await getAuthHeaders())
    .then(({ customer }) => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  await sdk.store.customer
    .deleteAddress(addressId, await getAuthHeaders())
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
