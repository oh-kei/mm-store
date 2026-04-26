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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'idle' | 'hover' | 'click'>('idle')

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (mode === 'idle') {
      setMode('hover')
      setActiveMenu("search")
    }
  }
  
  const handleMouseLeave = () => {
    if (mode === 'hover') {
      timeoutRef.current = setTimeout(() => {
        // Only close if the search input is not focused
        const isInputFocused = containerRef.current?.contains(document.activeElement) && document.activeElement?.tagName === 'INPUT'
        if (!isInputFocused) {
          setMode('idle')
          closeMenu()
        }
      }, 1000)
    }
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = containerRef.current?.querySelector('input[type="search"]') as HTMLInputElement
        if (input) input.focus()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setMode('idle')
    }
  }, [isOpen])

  const handleButtonClick = () => {
    if (mode === 'click') {
      setMode('idle')
      closeMenu()
    } else {
      setMode('click')
      setActiveMenu("search")
    }
  }

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <button
        onClick={handleButtonClick}
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
                
                <div className="relative group/scroll">
                   <div 
                    ref={scrollRef}
                    className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
                    style={{ overscrollBehavior: 'contain' }}
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
