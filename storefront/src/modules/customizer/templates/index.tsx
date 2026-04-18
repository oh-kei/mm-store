"use client"

import React, { useState } from "react"
import { Heading, Button, Text } from "@medusajs/ui"
import { Plus, Type, Image as ImageIcon, Trash2, ShoppingBag, Layers, MousePointer2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useCustomizer } from "../hooks/use-customizer"
import { uploadToS3 } from "../utils/upload"
import { addToCart } from "@lib/data/cart"
import { useParams, useRouter } from "next/navigation"
import { PropertiesPanel } from "../components/PropertiesPanel"

// Dynamically import Stage to avoid SSR issues with Konva
const CustomizerStage = dynamic(() => import("../components/stage"), {
  ssr: false,
})

interface CustomizerTemplateProps {
  product: any // Medusa Product
}

export function CustomizerTemplate({ product }: CustomizerTemplateProps) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const variant = product.variants?.[0]
  
  const {
    recipe,
    addTextLayer,
    addImageLayer,
    updateLayer,
    removeLayer,
    selectedId,
    setSelectedId,
  } = useCustomizer({
    id: product.id,
    variantId: variant?.id || "",
    imageUrl: product.thumbnail || "",
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

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
    if (!variant?.id) return

    setIsAddingToCart(true)
    try {
      await addToCart({
        variantId: variant.id,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 md:px-8">
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
                className="h-20 flex flex-col gap-2 rounded-2xl border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group"
                onClick={() => addTextLayer()}
              >
                <Type size={20} className="text-slate-400 group-hover:text-maritime-navy transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Text</span>
              </Button>
              
              <label className="h-20 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-maritime-gold transition-all cursor-pointer group">
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

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-maritime-gold mb-2">Base Product</p>
              <Heading className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{product.title}</Heading>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">{variant?.title}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Every customization is reviewed by our master tailors to ensure high-visibility and maritime durability.
                </Text>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-50">
               <Button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full h-16 bg-maritime-navy hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-maritime-navy/10 group overflow-hidden relative"
              >
                {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={18} className="group-hover:-translate-y-1 transition-transform" />
                    <span>Add Design to Bag</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
