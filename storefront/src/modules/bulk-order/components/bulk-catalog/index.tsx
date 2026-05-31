"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { CrewSelector } from "../crew-selector"
import { Heading } from "@medusajs/ui"
import { Box, ShoppingCart, ArrowLeft, Paintbrush } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { getVariantImage } from "@modules/products/utils/get-variant-image"

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
  onAddToCart: (productId: string, selection: { members: any[], colour: string | null, hasError?: boolean }) => void
}

export function BulkCatalog({ products, roster, customer, onAddToCart }: BulkCatalogProps) {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [selections, setSelections] = useState<Record<string, { members: any[], colour: string | null, hasError?: boolean }>>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set())
  const [sizingProduct, setSizingProduct] = useState<HttpTypes.StoreProduct | null>(null)

  const handleUpdate = React.useCallback((productId: string, selection: { members: any[], colour: string | null, hasError: boolean }) => {
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
            <Heading className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 leading-none">Catalogue</Heading>
            <p className="text-slate-400 text-sm font-medium mt-2">Select a Category</p>
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
                <p className="text-[10px] text-white/60 font-medium mb-1 hidden md:block">Category</p>
                <h3 className="font-medium text-lg md:text-xl text-white tracking-tight">{cat.name}</h3>
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
            className="flex items-center gap-2 text-[10px] font-medium text-slate-400 hover:text-maritime-gold transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            Back to Categories
          </button>
          <Heading className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 leading-none">
            {CATEGORIES.find(c => c.handle === activeCategory)?.name || "Products"}
          </Heading>
          <p className="text-slate-400 text-sm font-medium mt-2">Team Selection</p>
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
                    {(() => {
                      const selectedColor = selections[product.id || ""]?.colour
                      const selectedVariant = selectedColor 
                        ? product.variants?.find(v => v.options?.some(o => o.value?.toLowerCase() === selectedColor.toLowerCase()))
                        : undefined
                      
                      let thumb = (selectedVariant && getVariantImage(selectedVariant, product)) || product.thumbnail;

                      // If no color is selected, apply default fallback rules
                      if (!selectedColor) {
                        // Make sure cover image of duffel bag / small duffel show different colours by default
                        const titleLower = (product.title || "").toLowerCase();
                        if (titleLower.includes("duffel")) {
                          if (titleLower.includes("small")) {
                            // Small Duffel should default to Grey or Black variant if available
                            const otherColorImg = product.images?.find(i => {
                              const url = (i.url || "").toLowerCase();
                              return (url.includes("-grey") || url.includes("-gray") || url.includes("-black")) &&
                                     !url.includes("-side") && !url.includes("-back");
                            });
                            if (otherColorImg?.url) {
                              thumb = otherColorImg.url;
                            }
                          } else {
                            // Large Duffel should default to Navy if available
                            const navyImg = product.images?.find(i => {
                              const url = (i.url || "").toLowerCase();
                              return url.includes("-navy") && !url.includes("-side") && !url.includes("-back");
                            });
                            if (navyImg?.url) {
                              thumb = navyImg.url;
                            }
                          }
                        }
                      }

                      if (thumb && (thumb.includes("-side") || thumb.includes("-back"))) {
                        const front = product.images?.find(img => img.url && !img.url.includes("-side") && !img.url.includes("-back"));
                        thumb = front?.url || thumb;
                      }
                      return thumb ? (
                        <img src={thumb} alt={product.title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <Box className="text-slate-200" size={48} />
                      );
                    })()}
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-medium tracking-tight leading-none text-slate-900">{product.title}</h3>
                  {(() => {
                    const titleLower = product.title?.toLowerCase() || ""
                    const hasNoSizingGuide = 
                      titleLower.includes("hat clip") || 
                      titleLower.includes("banner") || 
                      titleLower.includes("flag") || 
                      titleLower.includes("neck scarf") || 
                      titleLower.includes("duffel")
                    
                    if (hasNoSizingGuide) return null;
                    return (
                      <button
                        onClick={() => setSizingProduct(product)}
                        className="text-[10px] font-semibold text-maritime-navy hover:text-maritime-gold transition-colors flex items-center gap-1.5 underline underline-offset-2 cursor-pointer shrink-0 ml-2"
                      >
                        Sizing Guide
                      </button>
                    )
                  })()}
                </div>
              </div>

              {/* Selector */}
              {(() => {
                const isCustomOnly = ["flag", "banner"].some(k => product.title?.toLowerCase().includes(k))
                if (isCustomOnly) {
                  return (
                    <div className="flex-grow flex flex-col justify-center items-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 p-4 min-h-[160px]">
                      <Paintbrush className="text-slate-300 mb-2" size={24} />
                      <p className="text-xs text-slate-500 font-medium">Custom design required</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-[200px]">Please go to Custom Studio to customize your banner or flag design before purchasing.</p>
                    </div>
                  )
                }
                return (
                  <div className="flex-grow pt-4 border-t border-slate-50">
                    <CrewSelector 
                      product={product} 
                      roster={roster} 
                      customer={customer}
                      onUpdate={(selection) => handleUpdate(product.id || "", selection)} 
                      forceShowMessage={addedProductIds.has(product.id || "")}
                    />
                  </div>
                )
              })()}

              {/* Actions */}
              <div className="mt-4 pt-6 border-t border-slate-50 flex flex-col gap-4">
                {(() => {
                  const isCustomOnly = ["flag", "banner"].some(k => product.title?.toLowerCase().includes(k))
                  if (isCustomOnly) {
                    return (
                      <div className="w-full">
                        <button 
                          onClick={() => {
                            router.push(`/${countryCode}/custom-studio?id=${product.id}`)
                          }}
                          className="w-full bg-maritime-gold text-maritime-navy h-12 rounded-xl font-semibold text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Paintbrush size={14} />
                          Customise
                        </button>
                      </div>
                    )
                  }
                  return (
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-medium text-slate-400 mb-1">Total Quantity</p>
                        <p className="text-2xl font-medium text-slate-900">{total} <span className="text-slate-300 text-xs font-medium ml-1">UNITS</span></p>
                      </div>
                      <button 
                        onClick={() => {
                          const productId = product.id || ""
                          onAddToCart(productId, selections[productId] || { members: [], colour: null })
                          setAddedProductIds(prev => new Set(prev).add(productId))
                        }}
                        disabled={total === 0 || selections[product.id || ""]?.hasError}
                        className="bg-maritime-gold text-maritime-navy h-12 px-6 rounded-xl font-medium text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ShoppingCart size={14} />
                        Add
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          )
        })}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
           <p className="text-slate-400 font-medium">No products found in this category.</p>
        </div>
      )}

      {/* Sizing Guide Modal */}
      {sizingProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col transform transition-all">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-maritime-navy/10 flex items-center justify-center text-maritime-navy">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-slate-900 leading-none">Sizing Guide</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-1.5">{sizingProduct.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setSizingProduct(null)} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Body */}
            <div className="p-8 bg-slate-50">
              <div data-lenis-prevent className="py-4 flex justify-center bg-white rounded-2xl p-4 border border-slate-100 shadow-inner">
                {(() => {
                  const sizingImage = sizingProduct.images?.find(img => img.url?.toLowerCase().includes("-sizing"))
                  return sizingImage?.url ? (
                    <img 
                      src={sizingImage.url} 
                      alt="Sizing Guide" 
                      className="max-w-full max-h-[50vh] h-auto object-contain rounded-xl" 
                    />
                  ) : (
                    <div className="text-sm text-slate-400 py-12 italic">
                      No sizing guide image available.
                    </div>
                  )
                })()}
              </div>
            </div>
            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-50 flex justify-end">
              <button 
                onClick={() => setSizingProduct(null)}
                className="h-10 px-6 bg-maritime-navy hover:bg-slate-900 text-white rounded-xl font-medium text-[10px] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
