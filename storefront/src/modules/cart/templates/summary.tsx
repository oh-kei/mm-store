"use client"

import { useState } from "react"
import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      
      <div className="flex items-start gap-x-2 py-4">
        <input 
          type="checkbox" 
          id="size-confirmation" 
          checked={confirmed}
          onChange={() => setConfirmed(!confirmed)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-maritime-navy focus:ring-maritime-navy cursor-pointer"
        />
        <label htmlFor="size-confirmation" className="text-xs text-ui-fg-subtle cursor-pointer select-none">
          I confirm I have checked that the size of all my products is correct with the sizing guide.
        </label>
      </div>

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className={`w-full ${!confirmed ? "pointer-events-none opacity-50" : ""}`}
      >
        <button
          className="w-full py-3 text-xs font-medium border transition-all rounded-lg bg-maritime-navy hover:bg-maritime-navy/90 text-white border-transparent flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!confirmed}
        >
          Checkout
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
