"use client"

import React, { useRef, useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const CATEGORIES = [
  { href: "/catalog", label: "All" },
  { href: "/catalog?category=tops", label: "Tops" },
  { href: "/catalog?category=jackets", label: "Jackets" },
  { href: "/catalog?category=hats", label: "Hats" },
  { href: "/catalog?category=event-items", label: "Event Items" },
  { href: "/catalog?category=bags-accessories", label: "Bags and Accessories" },
]

export default function NavCatalogueDropdown() {
  const { activeMenu, setActiveMenu } = useNavMenu()
  const [isLocked, setIsLocked] = useState(false)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDropdownOpen = activeMenu === "catalogue"

  // Sync locked state with global state
  useEffect(() => {
    if (!isDropdownOpen) setIsLocked(false)
  }, [isDropdownOpen])

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setActiveMenu("catalogue")
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768 && !isLocked) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(() => {
        setActiveMenu(null)
      }, 200)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked) {
      setIsLocked(false)
      setActiveMenu(null)
    } else {
      setIsLocked(true)
      setActiveMenu("catalogue")
    }
  }

  return (
    <div 
      className="relative flex items-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        onClick={handleButtonClick}
        className={`hover:text-white transition-colors py-2 text-white/90 outline-none ${isLocked ? 'text-white' : ''}`}
      >
        Catalogue
      </button>
      
      {/* Stateful Dropdown - hidden on mobile */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 w-48 z-[100] transition-all duration-300 pointer-events-none hidden md:block ${
          isDropdownOpen ? 'visible opacity-100 pointer-events-auto mt-4' : 'invisible opacity-0 mt-2'
        }`}
        style={{ top: "100%" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Bridge to prevent hover flickering */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-transparent" />
        <div className="bg-[#1c1c1c] border border-white/10 flex flex-col overflow-hidden rounded-b-2xl shadow-2xl transition-all duration-300 transform translate-z-0">
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
