"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { MagnifyingGlassMini, XMarkMini } from "@medusajs/icons"
import { Transition } from "@headlessui/react"
import { InstantSearch, useSearchBox } from "react-instantsearch-hooks-web"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import { useNavMenu } from "@modules/layout/components/nav-menu-context"

export default function SearchButton() {
  const { activeMenu, setActiveMenu, closeMenu } = useNavMenu()
  const isOpen = activeMenu === "search"
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleMouseEnter = () => {
    setActiveMenu("search")
  }

  const handleMouseLeave = () => {
    closeMenu()
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = containerRef.current?.querySelector('input[type="search"]') as HTMLInputElement
        if (input) input.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <button
        onClick={() => setActiveMenu(isOpen ? null : "search")}
        className="flex items-center gap-2 hover:text-white transition-colors outline-none py-2 text-white/90"
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
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div 
          className="absolute right-0 mt-4 w-[90vw] sm:w-[500px] z-[100]"
          style={{ top: "100%" }}
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4">
            <InstantSearch
              indexName={SEARCH_INDEX_NAME}
              searchClient={searchClient}
            >
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-2 p-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-white/10 transition-colors">
                  <MagnifyingGlassMini className="text-white/40" />
                  <SearchBox />
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <Hits 
                    hitComponent={Hit} 
                    className="!sm:w-full !max-h-none !opacity-100"
                    isDropdown={true} 
                  />
                </div>
              </div>
            </InstantSearch>
          </div>
        </div>
      </Transition>
    </div>
  )
}
