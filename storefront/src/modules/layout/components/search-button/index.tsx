"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Heading, Text, clx } from "@medusajs/ui"
import { MagnifyingGlassMini } from "@medusajs/icons"

import { useParams, usePathname } from "next/navigation"
import { InstantSearch } from "react-instantsearch-hooks-web"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

export default function SearchButton() {
  const { activeMenu, isLocked, isScrolled, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isOpen = activeMenu === "search"
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const isHomePage = (pathname === "/" || pathname === `/${countryCode}` || pathname === `/${countryCode}/`) && !isScrolled
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = containerRef.current?.querySelector('input[type="search"]') as HTMLInputElement
        if (input) input.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <div 
      className="static sm:relative flex items-center group cursor-pointer"
      ref={containerRef}
      onMouseEnter={() => openMenu("search")}
      onMouseLeave={() => closeMenu(300)}
    >
      <LocalizedClientLink
        href="/catalog"
        onClick={() => toggleMenu("search")}
        className="flex items-center gap-2 hover:text-white transition-colors outline-none py-2 text-white/90 cursor-pointer"
        aria-label="Search"
      >
        <MagnifyingGlassMini className="text-white/70" />
        <span className="font-medium hidden md:inline">
          Search
        </span>
      </LocalizedClientLink>

      <div 
        className={clx(
          "fixed sm:absolute left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 top-[80px] sm:top-full sm:-mt-2 sm:w-[350px] z-[100] pt-2 transition-all duration-200 ease-out origin-top",
          isOpen 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" 
            : "opacity-0 -translate-y-1 scale-95 pointer-events-none invisible"
        )}
        onMouseEnter={() => openMenu("search")}
        onMouseLeave={() => closeMenu(300)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bridge to prevent hover flickering - full width and taller */}
        <div className="absolute top-0 left-0 w-full h-4 bg-transparent" />
        <div 
          className={`border border-black/5 rounded-2xl shadow-2xl overflow-hidden p-4 ${
            isHomePage 
              ? "bg-white/20 border-white/10" 
              : "bg-[#f3f4f6]"
          }`}
          style={{ transform: "translateZ(0)" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <InstantSearch
            indexName={SEARCH_INDEX_NAME}
            searchClient={searchClient}
          >
            <div className="flex flex-col gap-y-4">
              <div className={`flex items-center gap-x-2 p-3 rounded-xl border transition-colors ${
                isHomePage 
                  ? "bg-white/10 border-white/10 focus-within:border-white/20" 
                  : "bg-black/5 border-black/5 focus-within:border-black/10"
              }`}>
                <MagnifyingGlassMini className={isHomePage ? "text-white/40" : "text-black/40"} />
                <SearchBox isHomePage={isHomePage} />
              </div>
              
              <div className="relative group/scroll">
                <div 
                  ref={scrollRef}
                  className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
                  style={{ overscrollBehavior: 'contain' }}
                  onWheel={(e) => e.stopPropagation()}
                >
                  <Hits 
                    hitComponent={Hit} 
                    className="!sm:w-full !max-h-none !opacity-100"
                    isDropdown={true} 
                  />
                </div>
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    </div>
  )
}
