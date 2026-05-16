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
import InteractiveNavWrapper from "@modules/layout/components/interactive-nav-wrapper"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await getCustomer()

  return (
    <NavMenuProvider>
      <InteractiveNavWrapper>
      
      <nav 
        id="main-nav"
        className="flex items-center justify-between w-full relative pointer-events-auto px-4 md:px-16"
      >
        {/* Left Side: Links */}
        <div 
          className="flex-1 flex items-center gap-2 sm:gap-4 md:gap-12 font-medium text-white/90"
          style={{ fontSize: "clamp(0.55rem, 1.2vw, 1rem)" }}
        >
          <div className="md:order-1">
            <NavCatalogueDropdown />
          </div>
          <div className="order-3 md:order-2">
            <LocalizedClientLink href="/custom-studio" className="hover:text-white transition-colors py-2 relative z-[110]">
              Custom Studio
            </LocalizedClientLink>
          </div>
          <div className="order-2 md:order-3 ml-2 md:ml-0">
            <LocalizedClientLink href="/bulk-order" className="hover:text-white transition-colors py-2 relative z-[110]">
              Bulk Order
            </LocalizedClientLink>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center items-center">
          <LocalizedClientLink href="/" className="relative z-[110]">
            <img 
              src="/dark-logo.webp" 
              alt="Mariners Market's" 
              className="object-contain logo-dark" 
              style={{ width: "auto", height: "clamp(3rem, 6vw, 4rem)" }}
            />
            <img 
              src="/light-logo.webp" 
              alt="Mariners Market's" 
              className="object-contain logo-light" 
              style={{ width: "auto", height: "clamp(3rem, 6vw, 4rem)" }}
            />
          </LocalizedClientLink>
        </div>

        {/* Right Side: Icons & Region */}
        <div className="flex-1 flex items-center justify-end gap-4 md:gap-12 text-white/90 relative z-[110]">
          <SearchButton />
          <NavRegionSelect />
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
      </InteractiveNavWrapper>
    </NavMenuProvider>
  )
}
