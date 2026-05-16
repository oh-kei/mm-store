"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { Heading, Button, Text, clx } from "@medusajs/ui"
import { Plus, Type, Image as ImageIcon, Trash2, ShoppingCart, Layers, MousePointer2, ChevronLeft, Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useCustomizer } from "../hooks/use-customizer"
import { uploadToS3 } from "../utils/upload"
import { addToCart, addBulkToCart } from "@lib/data/cart"
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { PropertiesPanel } from "../components/PropertiesPanel"
import { HttpTypes } from "@medusajs/types"
import { Users } from "lucide-react"
import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import { ViewType } from "../hooks/use-customizer"
import { ViewType } from "../hooks/use-customizer"
import { CrewSelector } from "@modules/bulk-order/components/crew-selector"
import { getCustomer } from "@lib/data/customer"
import { ProductCard } from "@modules/catalog/components/product-card"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import Divider from "@modules/common/components/divider"

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
  const pathname = usePathname()
  
  const [activeProduct, setActiveProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [quantity, setQuantity] = useState(1)

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
    activeView,
    setActiveView,
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
    if (activeProduct) {
      // Only initialize if we have no options OR if we switched to a DIFFERENT product
      // We check recipe.base.productId to see what's currently loaded in the workbench
      const isSwitchingProduct = recipe.base.productId && activeProduct.id !== recipe.base.productId
      const isEmpty = Object.keys(selectedOptions).length === 0
      
      if (isEmpty || isSwitchingProduct) {
        const initialOptions: Record<string, string> = {}
        const urlColor = searchParams.get("color")

        activeProduct.options?.forEach(opt => {
          const optionTitle = opt.title || ""
          const isColorOption = optionTitle.toLowerCase().includes("color") || optionTitle.toLowerCase().includes("colour")
          
          if (isColorOption && urlColor) {
            const matchingValue = opt.values?.find(v => v.value?.toLowerCase() === urlColor.toLowerCase())
            if (matchingValue) {
              initialOptions[optionTitle] = matchingValue.value
              return
            }
          }
          
          if (opt.values?.[0]) {
            initialOptions[optionTitle] = opt.values[0].value
          }
        })
        
        setSelectedOptions(initialOptions)
      }
    }
    // We only want to run this when the active product changes or on mount
    // Adding searchParams here as a dependency only for the INITIAL mount case
  }, [activeProduct?.id, recipe.base.productId])

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

    if (variant) {
       // Find the color option value robustly
       const colorOption = activeProduct.options?.find(opt => 
         (opt.title || "").toLowerCase().includes("color") || 
         (opt.title || "").toLowerCase().includes("colour")
       )
       const colorValue = colorOption ? selectedOptions[colorOption.title || ""] : null

       let imageUrl = (variant as any)?.images?.[0]?.url || activeProduct.thumbnail || ""

       if (colorValue) {
          const normalizedColor = colorValue.toLowerCase().replace(/\s+/g, "")
          const escapedColor = colorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          let suffix = ""
          if (activeView === "back") suffix = "-back"
          else if (activeView === "left" || activeView === "right") suffix = "-side"
          else if (["flag", "banner", "neck scarf"].some(k => activeProduct.title?.toLowerCase().includes(k))) {
            suffix = "-blank"
          }
          
          const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})${suffix}([-_.]|$)`, "i")
          const simplePattern = new RegExp(`${escapedNormalized}`, "i")
          
          const colorMatch = activeProduct.images?.find(img => pattern.test(img.url || "")) || 
                            activeProduct.images?.find(img => simplePattern.test(img.url || ""));

          if (colorMatch?.url) {
            imageUrl = colorMatch.url;
          }
       } else if (activeProduct.images) {
          let suffix = ""
          if (activeView === "back") suffix = "-back"
          else if (activeView === "left" || activeView === "right") suffix = "-side"
          else if (["flag", "banner", "neck scarf"].some(k => activeProduct.title?.toLowerCase().includes(k))) {
            suffix = "-blank"
          }
          
          const matchingImage = activeProduct.images.find(img => img.url?.includes(suffix));
          if (matchingImage) {
            imageUrl = matchingImage.url;
          }
       }

       if (recipe.base.variantId !== variant.id || recipe.base.productId !== activeProduct.id || recipe.base.imageUrl !== imageUrl) {
         setBase({
           productId: activeProduct.id,
           variantId: variant.id,
           imageUrl: imageUrl,
         })
       }
    }
  }, [selectedOptions, activeProduct, setBase, recipe.base.productId, recipe.base.variantId, activeView, recipe.base.imageUrl])

  const activeVariant = useMemo(() => {
    return activeProduct?.variants?.find(v => v.id === recipe.base.variantId) || activeProduct?.variants?.[0]
  }, [activeProduct, recipe.base.variantId])

  const [isUploading, setIsUploading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const { state: isCrewModalOpen, open: openCrewModal, close: closeCrewModal } = useToggleState(false)
  const [crewSelection, setCrewSelection] = useState<{ members: any[], colour: string | null, hasError?: boolean }>({ members: [], colour: null, hasError: false })
  const [roster, setRoster] = useState<any[]>([])
  const [comment, setComment] = useState("")

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

  // Lock body scroll when crew modal is open
  useEffect(() => {
    if (isCrewModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isCrewModalOpen])

  const stageRef = useRef<any>(null)

  const capturePreview = async () => {
    if (!stageRef.current) return null
    try {
      const dataUrl = await stageRef.current.getScreenshot()
      if (!dataUrl) return null
      
      // Convert data URL to File
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `preview-${Date.now()}.jpg`, { type: "image/jpeg" })
      
      const { publicUrl } = await uploadToS3(file)
      return publicUrl
    } catch (err) {
      console.error("Preview capture failed", err)
      return null
    }
  }

  const captureAllPreviews = async () => {
    const views = ["front", "back", "left", "right"]
    const previews: Record<string, string> = {}
    
    // Save current view to restore it later
    const originalView = activeView
    
    for (const view of views) {
      setActiveView(view as any)
      // Wait for re-render and image load - increased delay for reliability
      await new Promise(resolve => setTimeout(resolve, 800)) 
      const url = await capturePreview()
      if (url) {
        previews[view] = url
      } else if (view === "right" && previews["left"]) {
        // Fallback for right view if capture fails but left exists (since they usually share the same base image)
        previews[view] = previews["left"]
      }
    }
    
    setActiveView(originalView)
    return previews
  }

  const handleAddToCart = async (qty: number = 1) => {
    if (!customer) {
      localStorage.setItem("mm-customizer-recipe", JSON.stringify(recipe))
      localStorage.setItem("mm-customizer-options", JSON.stringify(selectedOptions))
      router.push(`/${countryCode}/account`)
      return
    }

    if (!activeVariant?.id) return

    setIsAddingToCart(true)
    try {
      let previews = {}
      try {
        previews = await captureAllPreviews()
      } catch (previewErr) {
        console.error("Preview capture failed, proceeding without it", previewErr)
      }
      
      await addToCart({
        variantId: activeVariant.id,
        quantity: qty,
        countryCode,
        metadata: {
          recipe: recipe,
          previews: previews,
          preview_url: (previews as any).front || (previews as any)[activeView] || null,
          comment: comment,
        },
      })
      // router.push(`/${countryCode}/cart`)
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
      const previews = await captureAllPreviews()
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
              crew_member: member.name,
              previews: previews,
              preview_url: (previews as any).front || (previews as any)[activeView] || null,
              comment: comment,
            }
          })
        }
      }

      closeCrewModal()
      // router.push(`/${countryCode}/cart`)
    } catch (err) {
      console.error("Bulk add failed", err)
    } finally {
      setIsAddingBulk(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { publicUrl, key } = await uploadToS3(file)
      addImageLayer(publicUrl, key)
    } catch (err) {
      console.error("Upload failed", err)
      alert("Failed to upload image. Please try again or use a different file.")
    } finally {
      setIsUploading(false)
    }
  }

  // Filter products for the selection grid
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [products, searchQuery])

  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-medium text-gray-900 tracking-tight font-sans">Choose something to design</h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[4px] bg-white border border-white overflow-hidden">
            {filteredProducts.map((p) => (
              <div 
                key={p.id}
                className="bg-white"
              >
                <ProductCard 
                  product={p}
                  region={region}
                  customer={customer}
                  mode="customizer"
                  onSelect={(product, color) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("id", product.id)
                    if (color) params.set("color", color)
                    else params.delete("color")
                    
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
                    
                    // Pre-initialize options to ensure they are available immediately
                    const initialOptions: Record<string, string> = {}
                    product.options?.forEach(opt => {
                      const title = opt.title || ""
                      const isColor = title.toLowerCase().includes("color") || title.toLowerCase().includes("colour")
                      if (isColor && color) {
                        const match = opt.values?.find(v => v.value?.toLowerCase() === color.toLowerCase())
                        if (match) {
                          initialOptions[title] = match.value
                          return
                        }
                      }
                      if (opt.values?.[0]) initialOptions[title] = opt.values[0].value
                    })
                    
                    setSelectedOptions(initialOptions)
                    setActiveProduct(product)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-48 pb-20 px-4 md:px-8 relative">
      {/* Absolute Back Button */}
      <Button 
        variant="secondary" 
        className="absolute top-32 left-8 p-3 h-12 w-12 rounded-2xl bg-white shadow-sm border-slate-100 hover:border-maritime-gold hover:text-maritime-gold transition-all z-10"
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
              <Heading className="text-2xl font-medium tracking-tight text-slate-900 leading-none">Custom Studio</Heading>
              <p className="text-slate-400 text-[10px] font-medium mt-2">Design Lab</p>
              <p className="text-slate-500 text-[11px] mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Please upload high-quality images (SVG or high-res PNG/JPG) to ensure the best print quality for your product!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="h-24 w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group"
                onClick={() => addTextLayer()}
              >
                <Type size={20} className="text-slate-400 group-hover:text-maritime-navy transition-colors" />
                <span className="text-[10px] font-medium text-slate-500">Text</span>
              </Button>
              
              <label className="h-24 w-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-maritime-gold transition-all cursor-pointer group">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*,.svg" disabled={isUploading} />
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-maritime-gold border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImageIcon size={20} className="text-slate-400 group-hover:text-maritime-gold transition-colors" />
                    <span className="text-[10px] font-medium text-slate-500">Logo</span>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <Layers size={14} />
                <span className="text-[10px] font-medium">Layers</span>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {recipe.layers.filter(l => l.view === activeView || (!l.view && activeView === 'front')).length === 0 && (
                  <p className="text-[10px] font-medium text-slate-300 italic">No layers added yet</p>
                )}
                {recipe.layers.filter(l => l.view === activeView || (!l.view && activeView === 'front')).map((layer) => (
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
                      <span className="text-[10px] font-medium truncate max-w-[100px]">
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
          <div className="bg-[#EDEEF3] rounded-[48px] overflow-hidden shadow-inner border border-slate-200 relative aspect-square flex items-center justify-center group mb-6">
            <div className="absolute inset-0 flex items-center justify-center p-12">
               <CustomizerStage 
                ref={stageRef}
                recipe={{
                  ...recipe,
                  layers: recipe.layers.filter(l => l.view === activeView || (!l.view && activeView === 'front'))
                }} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId}
                onUpdateLayer={updateLayer}
                activeView={activeView}
              />
            </div>
            
            {/* Stage Overlay UI */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MousePointer2 size={12} className="text-maritime-navy" />
                <span className="text-[9px] font-medium text-maritime-navy">Drag to Position</span>
              </div>
              <div className="h-3 w-px bg-maritime-navy/10" />
              <div className="flex items-center gap-2">
                <Plus size={12} className="text-maritime-navy rotate-45" />
                <span className="text-[9px] font-medium text-maritime-navy">Scale Handles</span>
              </div>
            </div>
          </div>

          {/* View Selector UI */}
          <div className="flex justify-center items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 w-max mx-auto">
             {(['front', 'back', 'left', 'right'] as ViewType[]).map((view) => {
               // Only show back/side views if they exist for the current product
               if (view === 'back' && !activeProduct.images?.some(img => img.url?.includes('-back'))) return null;
               if ((view === 'left' || view === 'right') && !activeProduct.images?.some(img => img.url?.includes('-side'))) return null;

               return (
                 <button
                   key={view.charAt(0).toUpperCase() + view.slice(1)}
                   onClick={() => setActiveView(view)}
                   className={clx(
                     "px-6 py-2 rounded-xl text-[10px] font-medium transition-all",
                     activeView === view 
                       ? "bg-maritime-navy text-white shadow-md" 
                       : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                   )}
                 >
                   {view.charAt(0).toUpperCase() + view.slice(1)}
                 </button>
               )
             })}
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
              <p className="text-[10px] font-medium text-maritime-gold mb-2">Base Product</p>
              <Heading className="text-2xl font-medium tracking-tight text-slate-900 leading-none">{activeProduct.title}</Heading>
            </div>

            {/* Options Selectors */}
            <div className="space-y-6">
              {activeProduct.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                  <span className="text-[10px] font-medium text-slate-400">{option.title}</span>
                  <div className="flex flex-wrap gap-2">
                    {option.values?.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [option.title || ""]: v.value }))}
                        className={clx(
                          "h-10 px-4 rounded-xl text-[9px] font-medium transition-all border",
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
            
            <Divider />

            <div className="flex items-center justify-between px-2">
               <p className="text-[10px] font-medium text-slate-400">Order Quantity</p>
               <div className="flex items-center border border-slate-100 rounded-xl overflow-hidden bg-slate-50 h-10">
                  <button 
                    onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                    className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q < 99 ? q + 1 : q)}
                    className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
               </div>
            </div>

            <div className="pt-2 border-t border-slate-50">
               <div className="mb-4">
                 <label className="text-[10px] font-medium text-slate-400 mb-2 block">Design Notes / Comments</label>
                 <textarea 
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Any special instructions for this design?"
                   className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 resize-none h-20 outline-none focus:border-maritime-gold focus:ring-1 focus:ring-maritime-gold transition-all text-slate-700 placeholder:text-slate-400"
                 />
               </div>

               <Button 
                onClick={() => handleAddToCart(quantity)}
                disabled={isAddingToCart || isAddingBulk}
                className="w-full h-16 bg-slate-100 hover:bg-maritime-navy text-slate-900 hover:text-white rounded-2xl font-medium text-xs flex items-center justify-center gap-3 transition-all group"
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
                className="w-full h-12 mt-3 bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-900 rounded-2xl font-medium text-xs flex items-center justify-center gap-3 group transition-all"
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
               <Heading className="text-xl font-medium tracking-tight text-slate-900">Buy for Crew</Heading>
               <Text className="text-[10px] font-medium text-slate-400">Select members and verify sizes/colours</Text>
             </div>
          </div>
        </Modal.Title>
        <Modal.Body>
          <div data-lenis-prevent className="py-4 w-full">
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
              <p className="text-[10px] font-medium text-slate-400">Items Selected</p>
              <p className="text-lg font-black text-maritime-navy">{crewSelection.members.length} {crewSelection.members.length === 1 ? 'Garment' : 'Garments'}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={closeCrewModal} className="h-12 px-6 rounded-xl font-medium text-[10px]">
                Cancel
              </Button>
              <Button 
                onClick={handleApplyToCrew} 
                disabled={isAddingBulk || crewSelection.members.length === 0 || crewSelection.hasError}
                className={clx("h-12 px-8 text-white rounded-xl font-medium text-xs shadow-lg transition-all", {
                  "bg-maritime-navy shadow-maritime-navy/20": !crewSelection.hasError,
                  "bg-slate-300 cursor-not-allowed opacity-50": crewSelection.hasError
                })}
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
