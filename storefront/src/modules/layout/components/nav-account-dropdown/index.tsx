"use client"

import React, { useState, useRef, useEffect, Fragment } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Transition } from "@headlessui/react"
import { useParams, usePathname } from "next/navigation"
import { signout, getCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

import { useNavMenu } from "@modules/layout/components/nav-menu-context"

export default function NavAccountDropdown({ customer: initialCustomer }: { customer: HttpTypes.StoreCustomer | null }) {
  const { activeMenu, isLocked, isScrolled, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isOpen = activeMenu === "account"
  const { countryCode } = useParams() as { countryCode: string }
  const pathname = usePathname()
  const isHomePage = (pathname === "/" || pathname === `/${countryCode}` || pathname === `/${countryCode}/`) && !isScrolled
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(initialCustomer)

  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (hasFetchedRef.current) return
    const fetchCustomer = async () => {
      try {
        const c = await getCustomer()
        setCustomer(c)
      } catch (e) {
        setCustomer(null)
      } finally {
        hasFetchedRef.current = true
      }
    }
    if (!initialCustomer) fetchCustomer()
    else hasFetchedRef.current = true
  }, [initialCustomer])

  const handleLogout = async () => {
    await signout(countryCode)
    window.location.href = `/${countryCode}/account`
  }

  const LINKS = [
    { href: "/account", label: "Overview" },
    { href: "/account/profile", label: "Profile" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
  ]

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => openMenu("account")}
      onMouseLeave={() => closeMenu(300)}
    >
      <LocalizedClientLink 
        href="/account"
        onClick={() => toggleMenu("account")}
        className="flex items-center gap-2 hover:text-white transition-colors outline-none py-2 text-white/90 cursor-pointer relative z-[110]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {customer && <div className="absolute top-1 right-[-4px] w-2 h-2 bg-emerald-500 rounded-full border border-black" />}
      </LocalizedClientLink>

      <Transition
        show={isOpen}
        as={Fragment}
        unmount={false}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div 
          className="fixed md:absolute left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-44 top-[80px] md:top-full pt-1 z-[100]"
          onMouseEnter={() => openMenu("account")}
          onMouseLeave={() => closeMenu(300)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bridge to prevent hover flickering - adjusted height */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-transparent" />
          <div className={`border border-black/5 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform translate-z-0 ${
            isHomePage 
              ? "bg-white/20 border-white/10" 
              : "bg-[#f3f4f6]"
          }`}>
            <div className="py-2">
              <LocalizedClientLink 
                href="/account"
                className={`px-4 py-2 border-b border-black/5 mb-1 block hover:bg-black/5 transition-all ${
                  isHomePage ? "text-white" : "text-black"
                }`}
                onClick={() => toggleMenu("account")}
              >
                <span className={`text-xs font-medium ${isHomePage ? "text-white" : "text-black"}`}>
                  {customer ? `Hi, ${customer.first_name}` : "Account"}
                </span>
              </LocalizedClientLink>
              
              {customer ? (
                <>
                  {LINKS.map((link) => (
                    <LocalizedClientLink
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 text-xs font-medium hover:bg-black/5 transition-all ${
                        isHomePage ? "text-white/70 hover:text-white" : "text-black/60 hover:text-black"
                      }`}
                      onClick={() => toggleMenu("account")} // Close and unlock on click
                    >
                      {link.label}
                    </LocalizedClientLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-black/5 transition-all border-t border-black/5 mt-1 ${
                      isHomePage ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"
                    }`}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <LocalizedClientLink
                    href="/account"
                    className={`block px-4 py-2 text-xs font-medium hover:bg-black/5 transition-all ${
                      isHomePage ? "text-white/80 hover:text-white" : "text-black/80 hover:text-black"
                    }`}
                    onClick={() => toggleMenu("account")}
                  >
                    Sign In
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/account?mode=register"
                    className={`block px-4 py-2 text-xs font-medium hover:bg-black/5 transition-all border-t border-black/5 mt-1 ${
                      isHomePage ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                    }`}
                    onClick={() => toggleMenu("account")}
                  >
                    Create Account
                  </LocalizedClientLink>
                </>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}
