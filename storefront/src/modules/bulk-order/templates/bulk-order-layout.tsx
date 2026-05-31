"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, clx } from "@medusajs/ui"
import { Users, ShoppingBag, ArrowLeft, HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Footer from "@modules/layout/templates/footer"

interface BulkOrderLayoutProps {
  children: React.ReactNode
}

export default function BulkOrderLayout({ children }: BulkOrderLayoutProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get("section") || "roster"
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const tutorialSteps = [
    {
      image: "/bulk-tutorial-1.webp",
      text: "1: Add members to your crew one by one by entering their name and size and clicking 'Add Member', or mass upload using an Excel file with Name and Size columns. Either way, they will be added to your active crew list."
    },
    {
      image: "/bulk-tutorial-2.webp",
      text: "2: On the catalogue page, select a base colour for your product, which will be the default colour applied to all members in this order."
    },
    {
      image: "/bulk-tutorial-3.webp",
      text: "3: Click 'All Crew' to select all members, or select individual members for whom you want this product to be ordered."
    },
    {
      image: "/bulk-tutorial-4.webp",
      text: "4: If you want a specific crew member to have a different colour or size than the default, edit them individually by selecting the member and clicking the pencil icon."
    }
  ]

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
            <div className="flex items-center justify-between">
              <Heading className="text-xl font-medium tracking-tight text-slate-900 leading-none">Bulk Order</Heading>
              <button 
                onClick={() => {
                  setCurrentStep(0)
                  setIsTutorialOpen(true)
                }}
                className="text-slate-400 hover:text-maritime-gold transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
                title="View Tutorial"
              >
                <HelpCircle size={26} />
              </button>
            </div>
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

      {/* Tutorial Popup Modal */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Click outside backdrop to close */}
          <div className="absolute inset-0" onClick={() => setIsTutorialOpen(false)} />
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 sm:p-8 w-[95vw] md:w-[90vw] max-w-5xl h-[90vh] max-h-[850px] relative z-10 flex flex-col items-center justify-between gap-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsTutorialOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 z-30"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center w-full shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maritime-gold">Tutorial</span>
              <h3 className="text-xl font-medium text-slate-900 tracking-tight mt-1">Bulk Ordering Guide</h3>
            </div>

             {/* Carousel Content */}
             <div className="w-full flex-grow flex flex-col items-center gap-4 min-h-0">
               <div className="relative w-full flex-grow overflow-hidden flex items-center justify-center min-h-0">
                 <img 
                   src={tutorialSteps[currentStep].image} 
                   alt={`Tutorial step ${currentStep + 1}`} 
                   className="w-full h-full object-contain mix-blend-multiply"
                 />
 
                 {/* Left Arrow */}
                 {currentStep > 0 && (
                   <button 
                     onClick={() => setCurrentStep(prev => prev - 1)}
                     className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                   >
                     <ChevronLeft size={24} />
                   </button>
                 )}
 
                 {/* Right Arrow */}
                 {currentStep < tutorialSteps.length - 1 && (
                   <button 
                     onClick={() => setCurrentStep(prev => prev + 1)}
                     className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                   >
                     <ChevronRight size={24} />
                   </button>
                 )}
               </div>

              {/* Step indicator dots */}
              <div className="flex gap-2 mt-1 shrink-0">
                {tutorialSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={clx(
                      "h-2 rounded-full transition-all duration-300",
                      currentStep === idx ? "w-8 bg-maritime-gold" : "w-2 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>

              {/* Text Description */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 w-full shrink-0 flex items-center justify-center text-center min-h-[90px]">
                <p className="text-[12px] sm:text-sm font-semibold leading-relaxed text-slate-600 max-w-2xl">
                  {tutorialSteps[currentStep].text}
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-4 w-full border-t border-slate-100 pt-4 shrink-0">
              {currentStep < tutorialSteps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex-1 bg-slate-900 text-white rounded-xl h-12 font-medium text-xs hover:bg-slate-800 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={() => setIsTutorialOpen(false)}
                  className="flex-1 bg-maritime-gold text-maritime-navy rounded-xl h-12 font-semibold text-xs hover:bg-yellow-500 transition-colors"
                >
                  Got It!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
