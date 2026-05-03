"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { MagnifyingGlassMini } from "@medusajs/icons"
import { Transition } from "@headlessui/react"
import { InstantSearch } from "react-instantsearch-hooks-web"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

export default function SearchButton() {
  const { activeMenu, isLocked, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isOpen = activeMenu === "search"
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
      className="static sm:relative flex items-center group border border-red-500/0 hover:border-red-500/30 cursor-pointer"
      ref={containerRef}
      onMouseEnter={() => openMenu("search")}
      onMouseLeave={() => closeMenu(300)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu("search")
        }}
        className={`flex items-center gap-2 hover:text-white transition-colors outline-none py-2 text-white/90 cursor-pointer ${isOpen && isLocked ? 'text-white' : ''}`}
        aria-label="Search"
      >
        <MagnifyingGlassMini className="text-white/70" />
        <span className="uppercase text-[10px] tracking-widest font-bold hidden md:inline">
          Search
        </span>
      </button>

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
          className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[85vw] max-w-[400px] sm:w-[450px] z-[100]"
          onMouseEnter={() => openMenu("search")}
          onMouseLeave={() => closeMenu(300)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bridge to prevent hover flickering - centered and narrow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-8 bg-transparent hidden sm:block" />
          <div 
            className="bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4" 
            style={{ transform: "translateZ(0)" }}
            onWheel={(e) => e.stopPropagation()}
          >
            <InstantSearch
              indexName={SEARCH_INDEX_NAME}
              searchClient={searchClient}
            >
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-2 p-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-white/10 transition-colors">
                  <MagnifyingGlassMini className="text-white/40" />
                  <SearchBox />
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
      </Transition>
    </div>
  )
}
