"use client"

import React, { useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const CATEGORIES = [
  { href: "/catalog", label: "All" },
  { href: "/catalog?category=tops", label: "Tops" },
  { href: "/catalog?category=jackets", label: "Jackets" },
  { href: "/catalog?category=hats", label: "Hats" },
  { href: "/catalog?category=event-items", label: "Event Items" },
  { href: "/catalog?category=bags", label: "Bags" },
]

export default function NavCatalogueDropdown() {
  const { activeMenu, setActiveMenu, closeMenu } = useNavMenu()
  const isDropdownOpen = activeMenu === "catalogue"
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setActiveMenu("catalogue")
    }, 150) // Small delay to avoid accidental triggers
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      closeMenu()
    }, 1000) // 1 second delay to improve hover-out behavior
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LocalizedClientLink 
        href="/catalog" 
        className="hover:text-white transition-colors py-2 text-white/90"
      >
        Catalogue
      </LocalizedClientLink>
      
      {/* Stateful Dropdown */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 w-48 z-[100] transition-all duration-300 pointer-events-none ${
          isDropdownOpen ? 'visible opacity-100 pointer-events-auto mt-0' : 'invisible opacity-0 mt-2'
        }`}
        style={{ top: "calc(100% + 4px)" }} // Adjusted to sit closer to the floating navbar
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col overflow-hidden rounded-b-2xl shadow-2xl transition-all duration-300 transform translate-z-0">
          {CATEGORIES.map((item, idx) => (
            <LocalizedClientLink 
              key={idx}
              href={item.href} 
              className={`px-4 text-sm font-medium text-white hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden flex items-center border-t border-white/5 first:border-0 ${
                isDropdownOpen ? 'max-h-12 opacity-100 py-2.5' : 'max-h-0 opacity-0 py-0'
              }`}
              style={{ 
                transitionDelay: isDropdownOpen ? `${idx * 50}ms` : '0ms' 
              }}
              onClick={() => setActiveMenu(null)}
            >
              {item.label}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
