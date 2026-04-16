"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

interface QuantityMatrixProps {
  product: HttpTypes.StoreProduct
  roster: { name: string; size: string }[]
  onUpdate: (quantities: Record<string, number>) => void
}

export function QuantityMatrix({ product, roster, onUpdate }: QuantityMatrixProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Find unique sizes for this product
  const sizes = product.options?.find(o => o.title?.toLowerCase().includes("size"))?.values?.map(v => v.value).filter(Boolean) as string[] || []

  const updateQuantity = (size: string, val: string) => {
    const num = parseInt(val) || 0
    const newQuants = { ...quantities, [size]: num }
    setQuantities(newQuants)
    onUpdate(newQuants)
  }

  const applyRoster = () => {
    const counts: Record<string, number> = {}
    
    // Initialize counts for all available product sizes
    sizes.forEach(s => counts[s] = 0)

    // Count people per size from roster
    roster.forEach(person => {
      // Normalize size check (e.g., L vs Large)
      const matchedSize = sizes.find(s => s.toLowerCase() === person.size.toLowerCase())
      if (matchedSize) {
        counts[matchedSize] = (counts[matchedSize] || 0) + 1
      }
    })

    setQuantities(counts)
    onUpdate(counts)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quantity Matrix</h4>
        <button 
          onClick={applyRoster}
          disabled={roster.length === 0}
          className="text-[10px] font-black uppercase tracking-widest text-maritime-gold border border-maritime-gold/20 px-3 py-1 rounded-full hover:bg-maritime-gold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Apply Roster
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {sizes.map(size => (
          <div key={size} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-300 text-center uppercase">{size}</span>
            <input 
              type="number"
              min="0"
              value={quantities[size] || ""}
              onChange={(e) => updateQuantity(size, e.target.value)}
              placeholder="0"
              className="bg-slate-50 border border-slate-100 rounded-lg h-9 w-full text-center text-sm font-bold focus:border-maritime-gold outline-none transition-all text-slate-900"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
