"use client"

import React, { useState, useRef, useEffect, Fragment } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Transition } from "@headlessui/react"
import { useParams } from "next/navigation"
import { signout, getCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

import { useNavMenu } from "@modules/layout/components/nav-menu-context"

export default function NavAccountDropdown({ customer: initialCustomer }: { customer: HttpTypes.StoreCustomer | null }) {
  const { activeMenu, setActiveMenu, closeMenu } = useNavMenu()
  const isOpen = activeMenu === "account"
  const { countryCode } = useParams() as { countryCode: string }
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(initialCustomer)

  useEffect(() => {
    // If we have an initial customer from the server, we don't need to fetch unless the menu opens
    if (initialCustomer && !isOpen) {
       setCustomer(initialCustomer)
       return
    }

    const fetchCustomer = async () => {
      try {
        const c = await getCustomer()
        setCustomer(c)
      } catch (e) {
        setCustomer(null)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [isOpen, initialCustomer]) // Re-fetch when menu opens or initial customer changes


  const handleLogout = async () => {
    await signout(countryCode)
    window.location.href = `/${countryCode}/account`
  }

  const [isLocked, setIsLocked] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync locked state with global state
  useEffect(() => {
    if (!isOpen) setIsLocked(false)
  }, [isOpen])

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setActiveMenu("account")
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768 && !isLocked) {
      timeoutRef.current = setTimeout(() => {
        setActiveMenu(null)
      }, 300)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked) {
      setIsLocked(false)
      setActiveMenu(null)
    } else {
      setIsLocked(true)
      setActiveMenu("account")
    }
  }

  const LINKS = [
    { href: "/account", label: "Overview" },
    { href: "/account/profile", label: "Profile" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
  ]

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`hover:text-white transition-colors flex items-center justify-center py-2 relative outline-none ${isLocked ? 'text-white' : ''}`}
        onClick={handleButtonClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {customer && <div className="absolute top-1 right-[-4px] w-2 h-2 bg-emerald-500 rounded-full border border-black" />}
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div 
          className="absolute right-0 top-full pt-1 w-48 z-[100]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Bridge to prevent hover flickering */}
          <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ transform: "translateZ(0)" }}>
          <div className="py-2">
              <div className="px-4 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">
                {customer ? `Hi, ${customer.first_name}` : "Account"}
              </span>
            </div>
            
            {customer ? (
              <>
                {LINKS.map((link) => (
                  <LocalizedClientLink
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setActiveMenu(null)}
                  >
                    {link.label}
                  </LocalizedClientLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-white/5 transition-all border-t border-white/5 mt-1"
                >
                  Log out
                </button>
              </>
            ) : (
              <LocalizedClientLink
                href="/account"
                className="block px-4 py-2 text-xs font-bold text-maritime-gold hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setActiveMenu(null)}
              >
                Sign In
              </LocalizedClientLink>
            )}
          </div>
        </div>
      </div>
    </Transition>
  </div>
)
}
