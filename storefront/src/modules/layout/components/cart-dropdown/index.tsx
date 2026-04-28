"use client"

import { Popover, Transition } from "@headlessui/react"
import { Button } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { getVariantImage } from "@modules/products/utils/get-variant-image"

import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const { activeMenu, setActiveMenu, closeMenu } = useNavMenu()
  const cartDropdownOpen = activeMenu === "cart"
  
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )

  const open = () => setActiveMenu("cart")
  const close = () => closeMenu()

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    setActiveMenu("cart")
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <Popover.Button className="h-full">
          <LocalizedClientLink
            className="hover:text-white relative flex items-center justify-center"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {/* Removed "Cart" text as requested */}
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-maritime-gold text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {totalItems}
              </div>
            )}
          </LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            static
            className="hidden small:block absolute top-[calc(100%+20px)] right-0 bg-[#1c1c1c] border border-white/10 w-[480px] rounded-xl overflow-hidden z-50 shadow-2xl"
            data-testid="nav-cart-dropdown"
            style={{ transform: "translateZ(0)" }}
          >
            <div className="p-6 border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Your Cart</h3>
            </div>
            
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[440px] px-6 py-4 grid grid-cols-1 gap-y-6 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1)
                    .map((item) => (
                      <div
                        className="grid grid-cols-[100px_1fr] gap-x-6 group/item"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.variant?.product?.handle}`}
                          className="aspect-square bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-2"
                        >
                          <Thumbnail
                            thumbnail={getVariantImage(item.variant) || item.variant?.product?.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                            className="w-full h-full object-contain mix-blend-lighten"
                          />
                        </LocalizedClientLink>
                        
                        <div className="flex flex-col justify-between py-1">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-[11px] font-bold text-white uppercase tracking-tight truncate max-w-[200px]">
                                <LocalizedClientLink
                                  href={`/products/${item.variant?.product?.handle}`}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <LineItemPrice item={item} style="tight" className="text-white font-black text-[11px]" />
                            </div>
                            
                            <div className="text-[10px] text-white/50 space-y-0.5">
                              <LineItemOptions
                                variant={item.variant}
                                className="inline-block"
                              />
                              <div className="flex items-center gap-2">
                                <span>Quantity: {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                             <DeleteButton
                                id={item.id}
                                className="text-[9px] uppercase tracking-[0.1em] font-black text-white/30 hover:text-red-400 transition-colors"
                              >
                                Remove
                              </DeleteButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-widest font-bold">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white">
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <LocalizedClientLink href="/cart" className="w-full">
                      <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-white hover:bg-white/5 transition-all rounded-lg">
                        View Cart
                      </button>
                    </LocalizedClientLink>
                    <LocalizedClientLink href="/checkout" className="w-full">
                      <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all rounded-lg shadow-lg shadow-white/5">
                        Checkout
                      </button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">Your cart is empty</p>
                <LocalizedClientLink href="/catalog">
                  <button onClick={close} className="px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] bg-white text-black rounded-lg hover:bg-gray-200 transition-all">
                    Explore Shop
                  </button>
                </LocalizedClientLink>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
