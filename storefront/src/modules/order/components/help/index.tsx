import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Need Help?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <a href="mailto:christopherlam@marinersmarkets.com" className="hover:text-[#D4AF37] transition-colors">
              contact christopherlam@marinersmarkets.com
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
