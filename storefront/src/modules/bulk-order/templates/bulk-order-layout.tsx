"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, clx } from "@medusajs/ui"
import { Users, ShoppingBag, ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Footer from "@modules/layout/templates/footer"

interface BulkOrderLayoutProps {
  children: React.ReactNode
}

export default function BulkOrderLayout({ children }: BulkOrderLayoutProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get("section") || "roster"

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar Navigation - Light Grey as requested */}
        <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 pt-32 md:pt-32 flex flex-col gap-8 shrink-0 z-20">
        <div className="flex flex-col gap-2">
          <LocalizedClientLink 
            href="/catalog" 
            className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Back to Retail
          </LocalizedClientLink>
          <Heading className="text-xl font-medium tracking-tight text-slate-900 leading-none">Bulk Order</Heading>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            href="/bulk-order?section=roster" 
            icon={<Users size={18} />} 
            label="Crew Roster" 
            isActive={currentSection === "roster"}
          />
          <NavItem 
            href="/bulk-order?section=catalog" 
            icon={<ShoppingBag size={18} />} 
            label="Catalogue" 
            isActive={currentSection === "catalog"}
          />
        </nav>
      </aside>

      {/* Main Content Area - White Background, Padded */}
      <div className="flex-grow flex flex-col min-h-screen">
        <main className="flex-grow p-8 md:p-12 pt-32 md:pt-40 bg-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        </div>
      </div>
      <Footer variant="dark" />
    </div>
  )
}

function NavItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <LocalizedClientLink 
      href={href}
      className={clx(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-medium group border",
        isActive 
          ? "bg-white text-slate-900 border-slate-100 shadow-sm" 
          : "text-slate-500 hover:text-slate-900 hover:bg-white border-transparent hover:border-slate-100"
      )}
    >
      <span className={clx(
        "transition-colors",
        isActive ? "text-maritime-gold" : "text-slate-300 group-hover:text-maritime-gold"
      )}>
        {icon}
      </span>
      {label}
    </LocalizedClientLink>
  )
}
