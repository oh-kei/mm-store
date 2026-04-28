"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Heading, Button, Text, clx } from "@medusajs/ui"
import { Plus, Type, Image as ImageIcon, Trash2, ShoppingCart, Layers, MousePointer2, ChevronLeft, Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useCustomizer } from "../hooks/use-customizer"
import { uploadToS3 } from "../utils/upload"
import { addToCart, addBulkToCart } from "@lib/data/cart"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { PropertiesPanel } from "../components/PropertiesPanel"
import { HttpTypes } from "@medusajs/types"
import { Users } from "lucide-react"
import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import { CrewSelector } from "@modules/bulk-order/components/crew-selector"
import { getCustomer } from "@lib/data/customer"

// Dynamically import Stage to avoid SSR issues with Konva
const CustomizerStage = dynamic(() => import("../components/stage"), {
  ssr: false,
})

interface CustomizerTemplateProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export function CustomizerTemplate({ products, region }: CustomizerTemplateProps) {
  const { countryCode } = useParams() as { countryCode: string }
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeProduct, setActiveProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    recipe,
    setRecipe,
    addTextLayer,
    addImageLayer,
    updateLayer,
    removeLayer,
    setBase,
    selectedId,
    setSelectedId,
  } = useCustomizer({
    id: activeProduct?.id || "",
    variantId: activeProduct?.variants?.[0]?.id || "",
    imageUrl: activeProduct?.thumbnail || "",
  })

  // Pre-select product from URL if id or handle matches
  useEffect(() => {
    const productId = searchParams.get("id")
    const handle = searchParams.get("handle")
    
    if ((productId || handle) && products.length > 0 && !activeProduct) {
      const product = products.find(p => p.id === productId || p.handle === handle)
      if (product) {
        setActiveProduct(product)
      }
    }
  }, [searchParams, products, activeProduct])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Initialize selected options from active product
  useEffect(() => {
    if (activeProduct && Object.keys(selectedOptions).length === 0) {
      const initialOptions: Record<string, string> = {}
      activeProduct.options?.forEach(opt => {
        if (opt.title && opt.values?.[0]) {
          initialOptions[opt.title] = opt.values[0].value
        }
      })
      setSelectedOptions(initialOptions)
    }
  }, [activeProduct])

  // Synchronize active product and variant selection with recipe
  useEffect(() => {
    if (!activeProduct) return

    const variant = activeProduct.variants?.find((v) => {
      return activeProduct.options?.every((opt) => {
        const optionTitle = opt.title || ""
        const variantOptionValue = v.options?.find(vo => vo.option_id === opt.id)?.value
        return selectedOptions[optionTitle] === variantOptionValue
      })
    })

    if (variant && (recipe.base.variantId !== variant.id || recipe.base.productId !== activeProduct.id)) {
       const colorValue = selectedOptions["Color"] || selectedOptions["Colour"]
       let imageUrl = (variant as any)?.images?.[0]?.url || activeProduct.thumbnail || ""

       if (colorValue) {
          const normalizedColor = colorValue.toLowerCase().replace(/\s+/g, "")
          const escapedColor = colorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})([-_.]|$)`, "i")
          
          const matchingImage = activeProduct.images?.find((img) => pattern.test(img.url || ""))
          if (matchingImage) {
            imageUrl = matchingImage.url || imageUrl
          }
       }

       setBase({
         productId: activeProduct.id,
         variantId: variant.id,
         imageUrl: imageUrl,
       })
    }
  }, [selectedOptions, activeProduct, setBase, recipe.base.productId, recipe.base.variantId])

  const activeVariant = useMemo(() => {
    return activeProduct?.variants?.find(v => v.id === recipe.base.variantId) || activeProduct?.variants?.[0]
  }, [activeProduct, recipe.base.variantId])

  const [isUploading, setIsUploading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const { state: isCrewModalOpen, open: openCrewModal, close: closeCrewModal } = useToggleState(false)
  const [crewSelection, setCrewSelection] = useState<{ members: any[], colour: string | null }>({ members: [], colour: null })
  const [roster, setRoster] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const cust = await getCustomer()
      setCustomer(cust)
      
      const saved = localStorage.getItem("mm-crew-roster")
      if (saved) {
        try { setRoster(JSON.parse(saved)) } catch(e) {}
      }

      const savedRecipe = localStorage.getItem("mm-customizer-recipe")
      const savedOptions = localStorage.getItem("mm-customizer-options")
      
      if (savedRecipe && savedOptions) {
        try {
          const parsedRecipe = JSON.parse(savedRecipe)
          const parsedOptions = JSON.parse(savedOptions)
          
          // Set options
          setSelectedOptions(parsedOptions)
          
          // Set recipe
          setRecipe(parsedRecipe)
          
          // Find and set active product if not already set
          if (!activeProduct && products.length > 0) {
            const product = products.find(p => p.id === parsedRecipe.base.productId)
            if (product) {
              setActiveProduct(product)
            }
          }
          
          // Clear storage so it doesn't persist forever
          localStorage.removeItem("mm-customizer-recipe")
          localStorage.removeItem("mm-customizer-options")
        } catch (e) {
          console.error("Failed to restore design", e)
        }
      }
    }
    init()
  }, [products, activeProduct, setRecipe])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { publicUrl, key } = await uploadToS3(file)
      addImageLayer(publicUrl, key)
    } catch (err) {
      console.error("Upload failed", err)
      alert("Failed to upload image. Please check your S3 configuration.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!customer) {
      localStorage.setItem("mm-customizer-recipe", JSON.stringify(recipe))
      localStorage.setItem("mm-customizer-options", JSON.stringify(selectedOptions))
      router.push(`/${countryCode}/account`)
      return
    }

    if (!activeVariant?.id) return

    setIsAddingToCart(true)
    try {
      await addToCart({
        variantId: activeVariant.id,
        quantity: 1,
        countryCode,
        metadata: {
          recipe: recipe,
        },
      })
      router.push(`/${countryCode}/cart`)
    } catch (err) {
      console.error("Add to cart failed", err)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const [isAddingBulk, setIsAddingBulk] = useState(false)

  const handleApplyToCrew = async () => {
    if (!activeProduct || crewSelection.members.length === 0) return

    setIsAddingBulk(true)
    try {
      const itemsToAdd: { variantId: string; quantity: number; metadata: any }[] = []
      
      const globalColor = crewSelection.colour || selectedOptions["Color"] || selectedOptions["Colour"]

      for (const member of crewSelection.members) {
        const targetSize = member.overrideSize || member.size
        const targetColor = member.overrideColour || globalColor

        // Find variant matching size and color
        const variant = activeProduct.variants?.find(v => {
          const hasSize = v.options?.some(o => o.value?.toLowerCase() === targetSize.toLowerCase())
          const hasColor = !targetColor || v.options?.some(o => o.value?.toLowerCase() === targetColor.toLowerCase())
          return hasSize && hasColor
        })

        if (variant) {
          await addToCart({
            variantId: variant.id,
            quantity: 1,
            countryCode,
            metadata: {
              recipe: {
                ...recipe,
                base: {
                  ...recipe.base,
                  variantId: variant.id
                }
              },
              crew_member: member.name
            }
          })
        }
      }

      closeCrewModal()
      router.push(`/${countryCode}/cart`)
    } catch (err) {
      console.error("Bulk add failed", err)
    } finally {
      setIsAddingBulk(false)
    }
  }

  // Filter products for the selection grid
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [products, searchQuery])

  if (!activeProduct) {
    return (
      <div className="fixed inset-0 bg-[#F8FAFC] pt-32 pb-8 px-4 md:px-8 flex flex-col">
        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-12 overflow-hidden">
          {/* Top Section for Product Selection */}
          <div className="w-full space-y-8 flex flex-col items-center text-center">
            <div className="space-y-4">
               <Heading className="text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">
                 CHOOSE ITEM
               </Heading>
               <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">Select something to design</p>
            </div>

            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder="Search garments..."
                className="w-full h-14 pl-12 pr-6 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-maritime-gold transition-all font-bold text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom Section: Product Grid */}
          <div data-lenis-prevent className="w-full overflow-y-auto pr-4 custom-scrollbar flex-1 pb-4 overscroll-contain">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setActiveProduct(p)}
                  className="group bg-white rounded-2xl p-0 border border-slate-100 hover:border-maritime-gold transition-all cursor-pointer hover:shadow-xl hover:shadow-maritime-gold/5 flex flex-col overflow-hidden"
                >
                  <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
                    <img 
                      src={p.thumbnail || null} 
                      alt={p.title || ""} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                  </div>
                  <div className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <Text className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate w-full">{p.title}</Text>
                      <Text className="text-[10px] font-bold text-maritime-navy">
                        {p.variants?.[0]?.calculated_price?.calculated_amount 
                          ? `$${Math.round(p.variants[0].calculated_price.calculated_amount)}` 
                          : ""}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 md:px-8 relative">
      {/* Absolute Back Button */}
      <Button 
        variant="secondary" 
        className="absolute top-8 left-8 p-3 h-12 w-12 rounded-2xl bg-white shadow-sm border-slate-100 hover:border-maritime-gold hover:text-maritime-gold transition-all z-10"
        onClick={() => {
          // Hard redirect to clear all states and URL parameters reliably
          window.location.href = `/${countryCode}/custom-studio`
        }}
      >
        <ChevronLeft size={24} />
      </Button>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Tools */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
            <div>
              <Heading className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Custom Studio</Heading>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Design Lab</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="h-24 w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group"
                onClick={() => addTextLayer()}
              >
                <Type size={20} className="text-slate-400 group-hover:text-maritime-navy transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Text</span>
              </Button>
              
              <label className="h-24 w-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-maritime-gold transition-all cursor-pointer group">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-maritime-gold border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImageIcon size={20} className="text-slate-400 group-hover:text-maritime-gold transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logo</span>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <Layers size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Layers</span>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {recipe.layers.length === 0 && (
                  <p className="text-[10px] font-bold text-slate-300 italic uppercase">No layers added yet</p>
                )}
                {recipe.layers.map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => setSelectedId(layer.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedId === layer.id 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                        : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${selectedId === layer.id ? "bg-white/10" : "bg-white border border-slate-100"}`}>
                        {layer.type === "text" ? <Type size={12} /> : <ImageIcon size={12} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[100px]">
                        {layer.type === "text" ? layer.props.text : "Logo Asset"}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                      className={`p-1 transition-colors ${selectedId === layer.id ? "text-white/40 hover:text-white" : "text-slate-300 hover:text-red-500"}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Stage */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="bg-[#EDEEF3] rounded-[48px] overflow-hidden shadow-inner border border-slate-200 relative aspect-square flex items-center justify-center group">
            <div className="absolute inset-0 flex items-center justify-center p-12">
               <CustomizerStage 
                recipe={recipe} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId}
                onUpdateLayer={updateLayer}
              />
            </div>
            
            {/* Stage Overlay UI */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MousePointer2 size={12} className="text-maritime-navy" />
                <span className="text-[9px] font-black uppercase tracking-widest text-maritime-navy">Drag to Position</span>
              </div>
              <div className="h-3 w-px bg-maritime-navy/10" />
              <div className="flex items-center gap-2">
                <Plus size={12} className="text-maritime-navy rotate-45" />
                <span className="text-[9px] font-black uppercase tracking-widest text-maritime-navy">Scale Handles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties & Action */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <PropertiesPanel 
            layer={recipe.layers.find(l => l.id === selectedId) || null}
            onUpdate={updateLayer}
            onRemove={removeLayer}
          />

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-maritime-gold mb-2">Base Product</p>
              <Heading className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{activeProduct.title}</Heading>
            </div>

            {/* Options Selectors */}
            <div className="space-y-6">
              {activeProduct.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{option.title}</span>
                  <div className="flex flex-wrap gap-2">
                    {option.values?.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [option.title || ""]: v.value }))}
                        className={clx(
                          "h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                          selectedOptions[option.title || ""] === v.value 
                            ? "bg-maritime-navy text-white border-maritime-navy shadow-lg" 
                            : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-50">
               <Button 
                onClick={handleAddToCart}
                disabled={isAddingToCart || isAddingBulk}
                className="w-full h-16 bg-maritime-navy hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-maritime-navy/10 group"
              >
                {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform" />
                    <span>{customer ? "Add Design to Cart" : "Sign In to Add to Cart"}</span>
                  </>
                )}
              </Button>

              <Button 
                onClick={openCrewModal}
                disabled={isAddingToCart || isAddingBulk || roster.length === 0}
                variant="secondary"
                className="w-full h-12 mt-3 bg-white hover:bg-slate-50 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group"
              >
                <Users size={16} className="text-maritime-gold group-hover:scale-110 transition-transform" />
                <span>Buy for all crew</span>
              </Button>
            </div>
          </div>
        </div>
        
      </div>

      {/* Crew Selection Modal */}
      <Modal isOpen={isCrewModalOpen} close={closeCrewModal} size="large">
        <Modal.Title>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-maritime-gold/10 flex items-center justify-center text-maritime-gold">
               <Users size={20} />
             </div>
             <div>
               <Heading className="text-xl font-black uppercase tracking-tight text-slate-900">Buy for Crew</Heading>
               <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select members and verify sizes/colours</Text>
             </div>
          </div>
        </Modal.Title>
        <Modal.Body>
          <div className="py-4">
             {activeProduct && (
               <CrewSelector 
                 product={activeProduct}
                 roster={roster}
                 customer={customer}
                 onUpdate={setCrewSelection}
                 initialColour={selectedOptions["Color"] || selectedOptions["Colour"]}
                 forceShowMessage={true}
               />
             )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Selected</p>
              <p className="text-lg font-black text-maritime-navy">{crewSelection.members.length} {crewSelection.members.length === 1 ? 'Garment' : 'Garments'}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={closeCrewModal} className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Cancel
              </Button>
              <Button 
                onClick={handleApplyToCrew} 
                disabled={isAddingBulk || crewSelection.members.length === 0}
                className="h-12 px-8 bg-maritime-navy text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-maritime-navy/20"
              >
                {isAddingBulk ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

    </div>
  )
}
