"use client"

import { Fragment, useState, useRef, useEffect } from "react"
import { Transition } from "@headlessui/react"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import ReactCountryFlag from "react-country-flag"

import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const REGIONS_DATA = [
  { name: "Europe", countries: [{ code: "fr", name: "France", currency: "EUR" }, { code: "de", name: "Germany", currency: "EUR" }, { code: "es", name: "Spain", currency: "EUR" }] },
  { name: "Hong Kong", countries: [{ code: "hk", name: "Hong Kong", currency: "HKD" }] },
  { name: "United States", countries: [{ code: "us", name: "United States", currency: "USD" }] },
  { name: "China", countries: [{ code: "cn", name: "China", currency: "CNY" }, { code: "tw", name: "Taiwan", currency: "TWD" }] },
  { name: "UK", countries: [{ code: "gb", name: "United Kingdom", currency: "GBP" }] },
]

export default function NavRegionSelect() {
  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1] || ""
  const { activeMenu, isLocked, openMenu, closeMenu, toggleMenu } = useNavMenu()
  const isOpen = activeMenu === "region"

  const activeCountry = REGIONS_DATA.flatMap(r => r.countries).find(c => c.code === countryCode)

  const handleCountryChange = (code: string) => {
    updateRegion(code, currentPath)
    toggleMenu("region")
  }

  return (
    <div 
      className="relative group border border-red-500/0 hover:border-red-500/30 cursor-pointer"
      onMouseEnter={() => openMenu("region")}
      onMouseLeave={() => closeMenu(300)}
    >
      <button 
        className={`flex items-center gap-2 hover:text-white transition-colors outline-none py-2 cursor-pointer ${isOpen && isLocked ? 'text-white' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu("region")
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="uppercase text-[10px] tracking-widest font-bold hidden md:inline text-white/90">
          {activeCountry ? activeCountry.code : "Region"}
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
          className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-64 z-[100]"
          onMouseEnter={() => openMenu("region")}
          onMouseLeave={() => closeMenu(300)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bridge to prevent hover flickering - centered and narrow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-8 bg-transparent" />
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ transform: "translateZ(0)" }}>
            <div className="py-2">
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">Select Region</span>
              </div>
              {REGIONS_DATA.map((region) => (
                <div key={region.name} className="px-2 mb-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">{region.name}</div>
                  {region.countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country.code)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-pointer ${
                        countryCode === country.code 
                          ? "bg-white/10 text-white" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={country.code}
                        style={{ width: '16px', height: '12px' }}
                      />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <span className="text-xs font-bold">{country.name}</span>
                        <span className="text-[10px] uppercase font-black text-white/30">{country.currency}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}
