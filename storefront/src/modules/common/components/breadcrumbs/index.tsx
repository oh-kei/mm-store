import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  name: string
  handle?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-x-2 text-[10px] uppercase tracking-[0.2em] font-black text-maritime-navy/40 mb-8">
      <LocalizedClientLink href="/" className="hover:text-maritime-navy transition-colors">
        Home
      </LocalizedClientLink>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          {index === items.length - 1 ? (
            <span className="text-maritime-navy font-black">{item.name}</span>
          ) : (
            <LocalizedClientLink 
              href={item.handle ? `/${item.handle}` : "/catalog"} 
              className="hover:text-maritime-navy transition-colors"
            >
              {item.name}
            </LocalizedClientLink>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs
