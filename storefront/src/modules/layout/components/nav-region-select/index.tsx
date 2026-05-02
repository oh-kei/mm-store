"use client"

import { Fragment, useState, useRef, useEffect } from "react"
import { Popover, Transition } from "@headlessui/react"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ReactCountryFlag from "react-country-flag"

import { useNavMenu } from "@modules/layout/components/nav-menu-context"

const REGIONS_DATA = [
  { name: "Europe", countries: [{ code: "fr", name: "France", currency: "EUR" }, { code: "de", name: "Germany", currency: "EUR" }, { code: "es", name: "Spain", currency: "EUR" }] },
  { name: "Hong Kong", countries: [{ code: "hk", name: "Hong Kong", currency: "HKD" }] },
  { name: "United States", countries: [{ code: "us", name: "United States", currency: "USD" }] },
  { name: "China", countries: [{ code: "cn", name: "China", currency: "CNY" }, { code: "tw", name: "Taiwan", currency: "TWD" }] },
  { name: "UK", countries: [{ code: "gb", name: "United Kingdom", currency: "GBP" }] },
]

export default function NavRegionSelect({ regions = [] }: { regions?: HttpTypes.StoreRegion[] }) {
  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1] || ""
  const { activeMenu, setActiveMenu, closeMenu } = useNavMenu()
  const isOpen = activeMenu === "region"

  const activeCountry = REGIONS_DATA.flatMap(r => r.countries).find(c => c.code === countryCode)

  const handleCountryChange = (code: string) => {
    updateRegion(code, currentPath)
    setActiveMenu(null)
  }


  return (
    <div 
      className="relative"
    >
      <button 
        className="flex items-center gap-2 hover:text-white transition-colors outline-none py-2"
        onClick={() => setActiveMenu(isOpen ? null : "region")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="uppercase text-[10px] tracking-widest font-bold hidden md:inline text-white/90">
          {activeCountry ? activeCountry.code : "Region"}
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
        <div className="absolute right-0 mt-4 w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden">
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
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all ${
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
      </Transition>
    </div>
  )
}
