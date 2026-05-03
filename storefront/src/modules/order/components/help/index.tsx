import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Need help?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <a href="mailto:support@marinersmarkets.com" className="hover:text-white transition-colors">Contact</a>
          </li>
          <li className="hover:text-white transition-colors">
            <a href="mailto:support@marinersmarkets.com" className="hover:text-white transition-colors">
              Returns & Exchanges
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
