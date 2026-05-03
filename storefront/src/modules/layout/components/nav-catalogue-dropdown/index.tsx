"use client"

import React, { useRef, useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const CATEGORIES = [
  { href: "/catalog?category=all", label: "All" },
  { href: "/catalog?category=tops", label: "Tops" },
  { href: "/catalog?category=jackets", label: "Jackets" },
  { href: "/catalog?category=hats", label: "Hats" },
  { href: "/catalog?category=event-items", label: "Event Items" },
  { href: "/catalog?category=bags-accessories", label: "Bags and Accessories" },
]

export default function NavCatalogueDropdown() {
  const { activeMenu, isLocked, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isDropdownOpen = activeMenu === "catalogue"

  return (
    <div 
      className="relative flex items-center group border border-red-500/0 hover:border-red-500/30 cursor-pointer"
      onMouseEnter={() => openMenu("catalogue")}
      onMouseLeave={() => closeMenu(300)}
    >
      <LocalizedClientLink 
        href="/catalog"
        onClick={(e) => {
          // Keep toggle for mobile/lock, but allow navigation
          toggleMenu("catalogue")
        }}
        className={`hover:text-white transition-colors py-2 text-white/90 outline-none cursor-pointer ${isDropdownOpen && isLocked ? 'text-white' : ''}`}
      >
        Catalogue
      </LocalizedClientLink>
      
      {/* Stateful Dropdown - hidden on mobile */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 w-48 z-[100] transition-all duration-300 pointer-events-none hidden md:block ${
          isDropdownOpen ? 'visible opacity-100 pointer-events-auto mt-4' : 'invisible opacity-0 mt-2'
        }`}
        style={{ top: "100%" }}
        onMouseEnter={() => openMenu("catalogue")}
        onMouseLeave={() => closeMenu(300)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bridge to prevent hover flickering - centered and narrow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-12 bg-transparent" />
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
              onClick={() => toggleMenu("catalogue")}
            >
              {item.label}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
