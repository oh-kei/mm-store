"use client"

import React, { useRef, useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"
import { usePathname, useParams } from "next/navigation"

const CATEGORIES = [
  { href: "/catalog?category=all", label: "All" },
  { href: "/catalog?category=tops", label: "Tops" },
  { href: "/catalog?category=jackets", label: "Jackets" },
  { href: "/catalog?category=hats", label: "Hats" },
  { href: "/catalog?category=event-items", label: "Event Items" },
  { href: "/catalog?category=bags-accessories", label: "Bags and Accessories" },
]

export default function NavCatalogueDropdown() {
  const { activeMenu, isLocked, isScrolled, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isDropdownOpen = activeMenu === "catalogue"
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const isHomePage = (pathname === "/" || pathname === `/${countryCode}` || pathname === `/${countryCode}/`) && !isScrolled

  return (
    <div 
      className="relative flex items-center group cursor-pointer"
      onMouseEnter={() => openMenu("catalogue")}
      onMouseLeave={() => closeMenu(300)}
    >
      <LocalizedClientLink 
        href="/catalog"
        className={`hover:text-white transition-colors py-2 text-white/90 outline-none cursor-pointer relative z-[110] ${isDropdownOpen && isLocked ? 'text-white' : ''}`}
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
        {/* Bridge to prevent hover flickering - centered and narrow, adjusted to not overlap link */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-4 bg-transparent" />
        <div className={`border border-black/5 flex flex-col overflow-hidden rounded-b-2xl shadow-2xl transition-all duration-300 transform translate-z-0 ${
          isHomePage 
            ? "bg-white/20 border-white/10" 
            : "bg-[#f3f4f6]"
        }`}>
          {CATEGORIES.map((item, idx) => (
            <LocalizedClientLink 
              key={idx}
              href={item.href} 
              className={`px-4 text-sm font-medium hover:bg-black/5 transition-all duration-300 overflow-hidden flex items-center border-t border-black/5 first:border-0 ${
                isHomePage ? "text-white hover:text-white" : "text-black hover:text-black"
              } ${
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
