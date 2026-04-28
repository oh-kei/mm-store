import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavRegionSelect from "@modules/layout/components/nav-region-select"
import CartButton from "@modules/layout/components/cart-button"
import NavCatalogueDropdown from "@modules/layout/components/nav-catalogue-dropdown"

import NavAccountDropdown from "@modules/layout/components/nav-account-dropdown"
import SearchButton from "@modules/layout/components/search-button"
import { getCustomer } from "@lib/data/customer"

import { NavMenuProvider } from "@modules/layout/components/nav-menu-context"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await getCustomer()

  return (
    <NavMenuProvider>
      <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 isolate pointer-events-none">
      {/* ... */}
      {/* Navbar Background Layer */}
      <div 
        className="absolute inset-0 max-w-5xl mx-auto h-full bg-[#1c1c1c]/75 backdrop-blur-xl border border-white/10 rounded-full" 
        style={{ 
          margin: "0 auto", 
          height: "100%", 
          top: "0",
          transform: "translateZ(0)",
          pointerEvents: "none"
        }} 
      />
      
      <nav 
        className="flex items-center justify-between w-full max-w-5xl relative pointer-events-auto"
        style={{ padding: "clamp(0.5rem, 1.5vh, 0.75rem) clamp(1rem, 3vw, 2rem)" }}
      >
        <div className="flex items-center gap-3 md:gap-8">
          <LocalizedClientLink href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Mariners Market" 
              className="object-contain rounded-md" 
              style={{ width: "clamp(2.75rem, 6vw, 3.25rem)", height: "clamp(2.75rem, 6vw, 3.25rem)" }}
            />
            <span 
              className="hidden md:inline font-bold text-white tracking-wider"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
            >
              Mariners' Markets
            </span>
          </LocalizedClientLink>

          <div 
            className="flex items-center gap-4 md:gap-8 font-medium text-white/90"
            style={{ fontSize: "clamp(0.65rem, 1.2vw, 1rem)" }}
          >
            <div className="md:order-1">
              <NavCatalogueDropdown />
            </div>
            <div className="order-3 md:order-2">
              <LocalizedClientLink href="/custom-studio" className="hover:text-white transition-colors py-2">
                Custom Studio
              </LocalizedClientLink>
            </div>
            <div className="order-2 md:order-3 ml-2 md:ml-0">
              <LocalizedClientLink href="/bulk-order" className="hover:text-white transition-colors py-2">
                Bulk Order
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 text-white/90">
          <SearchButton />
          <NavRegionSelect regions={regions} />
          <NavAccountDropdown customer={customer} />
          
          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:text-white flex gap-2"
                href="/cart"
              >
                {/* ShoppingCart Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </nav>
    </div>
    </NavMenuProvider>
  )
}
