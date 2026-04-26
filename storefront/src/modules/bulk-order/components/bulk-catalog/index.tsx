"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { CrewSelector } from "../crew-selector"
import { Heading } from "@medusajs/ui"
import { Box, ShoppingCart, ArrowLeft } from "lucide-react"

const CATEGORIES = [
  { name: "All", handle: "all", image: "/mm-allclothes.webp" },
  { name: "Tops", handle: "tops", image: "/mariners-market-polo.webp" },
  { name: "Jackets", handle: "jackets", image: "/mariners-jacket.webp" },
  { name: "Hats", handle: "hats", image: "/mm-hats-blackwhite.webp" },
  { name: "Event Items", handle: "event-items", image: "/mm-regatta-banner.webp" },
  { name: "Bags and Accessories", handle: "bags-accessories", image: "/mm-duffel-navy.webp" },
]

interface BulkCatalogProps {
  products: HttpTypes.StoreProduct[]
  roster: { name: string; size: string }[]
  customer: HttpTypes.StoreCustomer | null
  onAddToCart: (productId: string, selection: { members: any[], colour: string | null }) => void
}

export function BulkCatalog({ products, roster, customer, onAddToCart }: BulkCatalogProps) {
  const [selections, setSelections] = useState<Record<string, { members: any[], colour: string | null }>>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set())

  const handleUpdate = React.useCallback((productId: string, selection: { members: any[], colour: string | null }) => {
    setSelections(prev => {
      // Small optimization to avoid state churn if same
      const current = prev[productId]
      if (current?.colour === selection.colour && current?.members.length === selection.members.length) {
        // deep check might be overkill, but let's just always update or just set it
        return { ...prev, [productId]: selection }
      }
      return { ...prev, [productId]: selection }
    })
  }, [])

  const getCountForProduct = (productId: string) => {
    return selections[productId]?.members?.length || 0
  }

  const filteredProducts = activeCategory && activeCategory !== "all"
    ? products.filter(p => {
        const catMatch = p.categories?.some(c => c.handle === activeCategory || c.name?.toLowerCase() === activeCategory)
        const typeMatch = p.type?.value?.toLowerCase() === activeCategory
        const collectionMatch = p.collection?.handle === activeCategory || p.collection?.title?.toLowerCase() === activeCategory
        return catMatch || typeMatch || collectionMatch
      })
    : products

  if (!activeCategory) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-end border-b border-slate-100 pb-8">
          <div>
            <Heading className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">Catalogue</Heading>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">Select a Category</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.handle} 
              onClick={() => setActiveCategory(cat.handle)}
              className="group relative aspect-[4/5] overflow-hidden bg-[#EDEEF3] p-0 text-left"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-x-0 bottom-0 p-2 md:p-6 bg-gradient-to-t from-black/20 to-transparent">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-black mb-1 hidden md:block">Category</p>
                <h3 className="font-black text-lg md:text-xl text-white tracking-tight uppercase">{cat.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <button 
            onClick={() => setActiveCategory(null)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-maritime-gold transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Back to Categories
          </button>
          <Heading className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">
            {CATEGORIES.find(c => c.handle === activeCategory)?.name || "Products"}
          </Heading>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">Team Selection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => {
          const total = getCountForProduct(product.id || "")
          return (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-6 hover:shadow-xl hover:border-slate-200 transition-all group relative overflow-hidden">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden p-8 flex items-center justify-center border border-slate-100">
                   {product.thumbnail ? (
                     <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                   ) : (
                     <Box className="text-slate-200" size={48} />
                   )}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight leading-none text-slate-900">{product.title}</h3>
                </div>
              </div>

              {/* Selector */}
              <div className="flex-grow pt-4 border-t border-slate-50">
                <CrewSelector 
                  product={product} 
                  roster={roster} 
                  customer={customer}
                  onUpdate={(selection) => handleUpdate(product.id || "", selection)} 
                  forceShowMessage={addedProductIds.has(product.id || "")}
                />
              </div>

              {/* Actions */}
              <div className="mt-4 pt-6 border-t border-slate-50 flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Quantity</p>
                    <p className="text-2xl font-black text-slate-900">{total} <span className="text-slate-300 text-xs font-bold ml-1">UNITS</span></p>
                  </div>
                  <button 
                    onClick={() => {
                      const productId = product.id || ""
                      onAddToCart(productId, selections[productId] || { members: [], colour: null })
                      setAddedProductIds(prev => new Set(prev).add(productId))
                    }}
                    disabled={total === 0}
                    className="bg-maritime-gold text-maritime-navy h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ShoppingCart size={14} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
