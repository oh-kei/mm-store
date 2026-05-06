"use client"

import React, { useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading, Button, clx } from "@medusajs/ui"
import { Minus, Plus, User, Users, Check, AlertTriangle } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface SelectionMember extends CrewMember {
  overrideSize?: string
  overrideColour?: string
}

const Edit2 = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
)

interface CrewSelectorProps {
  product: HttpTypes.StoreProduct
  roster: CrewMember[]
  customer: HttpTypes.StoreCustomer | null
  onUpdate: (selection: { members: SelectionMember[], colour: string | null, hasError: boolean }) => void
  forceShowMessage?: boolean
  initialColour?: string | null
}

export function CrewSelector({ product, roster, customer, onUpdate, forceShowMessage, initialColour }: CrewSelectorProps) {
  const [selectedColour, setSelectedColour] = useState<string | null>(initialColour || null)
  const [selectionMode, setSelectionMode] = useState<"all" | "select">("all")
  const [selectedMemberIndices, setSelectedMemberIndices] = useState<number[]>([])
  const [overrides, setOverrides] = useState<Record<number, { size?: string; colour?: string }>>({})
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      black: "#000000",
      white: "#FFFFFF",
      navy: "#1E3A8A",
      grey: "#4B5563",
      gray: "#4B5563",
      blue: "#3B82F6",
      red: "#EF4444",
      green: "#10B981",
      yellow: "#FFD700",
      cyan: "#06B6D4",
      "light green": "#86EFAC",
      lightgreen: "#86EFAC",
      "light blue": "#ADD8E6",
      lightblue: "#ADD8E6",
      "dark blue": "#1E3A8A",
      orange: "#F97316",
      "cool blue": "#60A5FA",
      "khaki": "#C3B091",
      "dark green": "#064E3B",
      "red black": "linear-gradient(135deg, #EF4444 49%, #EF4444 51%, #000000 51%)",
      "blue black": "linear-gradient(135deg, #3B82F6 49%, #3B82F6 51%, #000000 51%)",
      "red/black": "linear-gradient(135deg, #EF4444 49%, #EF4444 51%, #000000 51%)",
      "blue/black": "linear-gradient(135deg, #3B82F6 49%, #3B82F6 51%, #000000 51%)",
    }
    return map[colorName.toLowerCase()] || "#E5E7EB"
  }

  const getLuminance = (color: string) => {
    if (color.includes('gradient')) return 0.5;
    const hex = color.replace('#', '');
    if (hex.length !== 6) return 0.5;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // Extract available colors from product options and sort by luminance (lightest to darkest)
  const colorOption = product.options?.find(o => {
    const t = o.title?.toLowerCase() || ""
    return t.includes("color") || t.includes("colour") || t.includes("design") || t.includes("style")
  })
  const colors = (colorOption?.values?.map(v => v.value).filter(Boolean) as string[] || []).sort((a, b) => {
    const lumA = getLuminance(getColorHex(a));
    const lumB = getLuminance(getColorHex(b));
    return lumB - lumA;
  })

  // Extract available sizes
  const sizeOption = product.options?.find(o => o.title?.toLowerCase().includes("size"))
  const availableSizes = sizeOption?.values?.map(v => v.value).filter(Boolean) as string[] || []
  
  const isOneSize = availableSizes.length === 1
  const oneSize = isOneSize ? availableSizes[0] : null

  // Current effective members selection with overrides applied
  const selectedMembers = useMemo(() => {
    const base = selectionMode === "all" ? roster.map((m, i) => ({ ...m, originalIdx: i })) : roster.map((m, i) => ({ ...m, originalIdx: i })).filter(m => selectedMemberIndices.includes(m.originalIdx))
    
    return base.map(m => ({
      ...m,
      overrideSize: isOneSize ? (oneSize || undefined) : overrides[m.originalIdx]?.size,
      overrideColour: overrides[m.originalIdx]?.colour
    }))
  }, [roster, selectionMode, selectedMemberIndices, overrides, isOneSize, oneSize])

  // Sync up to parent
  useEffect(() => {
    const hasError = selectedMembers.some(m => availableSizes.length > 0 && !availableSizes.includes(m.overrideSize || m.size))
    onUpdate({ members: selectedMembers, colour: selectedColour, hasError })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, selectedColour, availableSizes])

  const handleToggleMember = (idx: number) => {
    setHasInteracted(true)
    setSelectedMemberIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const handleUpdateOverride = (idx: number, type: 'size' | 'colour', value: string) => {
    setHasInteracted(true)
    setOverrides(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [type]: value === 'default' ? undefined : value
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Color Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Global Colour</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => {
                setSelectedColour(color)
                setHasInteracted(true)
              }}
              className={clx(
                "h-10 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                selectedColour === color 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-900 border-slate-100 hover:border-slate-300"
              )}
            >
              {color}
            </button>
          ))}
          {colors.length === 0 && <p className="text-xs text-slate-400 font-bold italic">No colours available</p>}
        </div>
      </div>

      {/* One Size Message */}
      {isOneSize && (hasInteracted || forceShowMessage) && (
        <div className="bg-maritime-gold/10 border border-maritime-gold/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertTriangle className="text-maritime-gold flex-shrink-0" size={16} />
          <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-wider">
            Note: This item is <span className="text-maritime-gold font-black">ONE SIZE ONLY ({oneSize})</span>. 
            All member sizes have been automatically adjusted to fit.
          </p>
        </div>
      )}

      {/* Crew Selection Dropdown */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Crew Selection</h4>
        
        <div className="relative">
          <button
            onClick={() => setSelectionMode(prev => prev === "all" ? "select" : "all")}
            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                {selectionMode === "all" ? <Users size={16} /> : <User size={16} />}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {selectionMode === "all" ? "All Crew" : `${selectedMemberIndices.length} Members Selected`}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase">
                  {selectionMode === "all" ? `Total: ${roster.length} People` : "Custom Selection"}
                </p>
              </div>
            </div>
            <div className={clx("transition-transform duration-300", selectionMode === "select" ? "rotate-180" : "")}>
              <Plus size={16} className="text-slate-300" />
            </div>
          </button>

          {/* Global Error Message for Unavailable Sizes - Only show after interaction */}
          {(hasInteracted || forceShowMessage) && selectedMembers.some(m => availableSizes.length > 0 && !availableSizes.includes(m.overrideSize || m.size)) && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-[10px] font-bold text-red-600 leading-relaxed uppercase tracking-wider">
                Some selected members have <span className="font-black underline">unavailable sizes</span> for this product. 
                Please adjust their sizes or remove them to proceed.
              </p>
            </div>
          )}

          {/* Expandable Dropdown Content */}
          <div className={clx(
            "mt-2 overflow-hidden transition-all duration-500 ease-in-out",
            selectionMode === "select" ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}>
            <div 
              data-lenis-prevent
              className="bg-slate-50/50 rounded-[24px] border border-slate-100 p-2 space-y-1 overflow-y-auto max-h-[320px] custom-scrollbar shadow-inner"
            >
               {/* "Select All" Toggles for quick management */}
               <div className="flex gap-1 mb-2 px-1">
                 <button 
                   onClick={() => setSelectedMemberIndices(roster.map((_, i) => i))}
                   className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-400 rounded-lg hover:border-slate-200 hover:text-slate-600 transition-all"
                 >
                   Select All
                 </button>
                 <button 
                   onClick={() => setSelectedMemberIndices([])}
                   className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-400 rounded-lg hover:border-slate-200 hover:text-slate-600 transition-all"
                 >
                   Clear All
                 </button>
               </div>

              {roster.map((member, idx) => {
                const isSelected = selectedMemberIndices.includes(idx)
                const isEditing = editingMemberIdx === idx
                const currentOverride = overrides[idx] || {}
                
                return (
                  <div key={`${member.name}-${idx}`} className="space-y-1">
                    <button
                      onClick={() => handleToggleMember(idx)}
                      className={clx(
                        "w-full p-3 rounded-xl border flex items-center justify-between transition-all group/item",
                        isSelected ? "bg-white border-maritime-gold/20 shadow-sm" : "bg-transparent border-transparent hover:bg-white/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={clx(
                          "h-5 w-5 rounded-md flex items-center justify-center border transition-all",
                          isSelected ? "bg-maritime-gold border-maritime-gold text-white" : "bg-white border-slate-200 text-transparent"
                        )}>
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <div className="text-left">
                          <p className={clx("text-xs font-black uppercase tracking-tight", isSelected ? "text-slate-900" : "text-slate-400")}>
                            {member.name}
                          </p>
                          <div className="flex items-center gap-2">
                             <p className="text-[9px] font-bold text-slate-300 uppercase">
                               Size: {currentOverride.size || member.size}
                               {currentOverride.size && <span className="text-maritime-gold ml-1">(OVERRIDE)</span>}
                             </p>
                             {currentOverride.colour && (
                               <p className="text-[9px] font-bold text-maritime-gold uppercase">
                                 Colour: {currentOverride.colour}
                               </p>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          {availableSizes.length > 0 && !availableSizes.includes(currentOverride.size || member.size) && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                              <AlertTriangle size={10} className="text-red-500" />
                              <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Size Unavailable</span>
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingMemberIdx(isEditing ? null : idx)
                            }}
                            className={clx(
                              "p-2 rounded-lg transition-colors bg-slate-50 hover:bg-maritime-gold/10",
                              isEditing ? "text-maritime-gold" : "text-slate-300"
                            )}
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </button>

                    {/* Size Unavailable Action Hint */}
                    {isSelected && availableSizes.length > 0 && !availableSizes.includes(currentOverride.size || member.size) && !isEditing && (
                      <div className="px-3 pb-2 flex gap-2">
                         <button 
                           onClick={() => setEditingMemberIdx(idx)}
                           className="text-[9px] font-black uppercase tracking-widest text-maritime-gold hover:underline"
                         >
                           Change Size
                         </button>
                         <button 
                           onClick={() => {
                             if (selectionMode === "all") {
                               setSelectionMode("select")
                               setSelectedMemberIndices(roster.map((_, i) => i).filter(i => i !== idx))
                             } else {
                               handleToggleMember(idx)
                             }
                           }}
                           className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:underline"
                         >
                           Remove from Selection
                         </button>
                      </div>
                    )}

                    {/* Inline Override Controls */}
                    {isEditing && isSelected && (
                      <div className="px-3 pb-3 pt-1 space-y-3 animate-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Override Size</label>
                            <select 
                              value={currentOverride.size || "default"}
                              onChange={(e) => handleUpdateOverride(idx, 'size', e.target.value)}
                              className="w-full bg-white border border-slate-100 rounded-lg h-8 px-2 text-[10px] font-bold outline-none focus:border-maritime-gold"
                            >
                              <option value="default">Default ({member.size})</option>
                              {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Override Colour</label>
                            <select 
                              value={currentOverride.colour || "default"}
                              onChange={(e) => handleUpdateOverride(idx, 'colour', e.target.value)}
                              className="w-full bg-white border border-slate-100 rounded-lg h-8 px-2 text-[10px] font-bold outline-none focus:border-maritime-gold"
                            >
                              <option value="default">Global ({selectedColour || "None"})</option>
                              {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

