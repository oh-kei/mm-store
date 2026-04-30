"use client"

import React, { useRef, useState } from "react"
import { CustomLayer, LayerProps } from "../hooks/use-customizer"
import { Heading, Input, Label, Text, Button } from "@medusajs/ui"
import { Trash2, Type, Move, RotateCcw, Palette, Pipette, ChevronDown, ChevronUp } from "lucide-react"

interface PropertiesPanelProps {
  layer: CustomLayer | null
  onUpdate: (id: string, props: Partial<LayerProps>) => void
  onRemove: (id: string) => void
}

const FONT_FAMILIES = [
  { label: "Panchang", value: "Panchang" },
  { label: "Outfit", value: "Outfit" },
  { label: "Inter", value: "Inter" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Manrope", value: "Manrope" },
  { label: "Monospace", value: "monospace" },
]

const DEFAULT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#2563EB" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#94A3B8" },
  { name: "Red", value: "#EF4444" },
]

export const PropertiesPanel = ({ layer, onUpdate, onRemove }: PropertiesPanelProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [isFontListExpanded, setIsFontListExpanded] = useState(false)

  if (!layer) {
    return (
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <Type size={24} className="text-slate-200" />
        </div>
        <Heading className="text-xl font-black uppercase tracking-tight text-slate-300">Select an element</Heading>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">To reveal properties</p>
      </div>
    )
  }

  const isText = layer.type === "text"

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Properties</Heading>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Adjust Layer</p>
          </div>
          <Button 
            variant="secondary" 
            className="w-10 h-10 p-0 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 border-none transition-all"
            onClick={() => onRemove(layer.id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Content Section */}
        {isText && (
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Text Content</Label>
            <Input 
              value={layer.props.text || ""} 
              onChange={(e) => onUpdate(layer.id, { text: e.target.value })}
              className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12 text-sm font-bold"
            />
          </div>
        )}

        {/* Styling Section */}
        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-maritime-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Styling</span>
          </div>

          {isText && (
            <>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Font Family</Label>
                <div className="relative">
                  <button
                    onClick={() => setIsFontListExpanded(!isFontListExpanded)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between transition-all hover:bg-slate-100"
                  >
                    <span className="text-xs font-bold" style={{ fontFamily: layer.props.fontFamily || "Inter" }}>
                      {FONT_FAMILIES.find(f => f.value === layer.props.fontFamily)?.label || "Inter"}
                    </span>
                    {isFontListExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isFontListExpanded && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1 overscroll-contain">
                        {FONT_FAMILIES.map((font) => (
                          <button
                            key={font.value}
                            onClick={() => {
                              onUpdate(layer.id, { fontFamily: font.value })
                              setIsFontListExpanded(false)
                            }}
                            className={`w-full h-10 px-3 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between ${
                              layer.props.fontFamily === font.value 
                                ? "bg-maritime-navy text-white shadow-md" 
                                : "text-slate-500 hover:bg-slate-50"
                            }`}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                            {layer.props.fontFamily === font.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-maritime-gold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Size</Label>
                  <span className="text-[10px] font-black text-maritime-navy">{layer.props.fontSize || 40}px</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  value={layer.props.fontSize || 40}
                  onChange={(e) => onUpdate(layer.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full accent-maritime-gold h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onUpdate(layer.id, { fill: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        layer.props.fill === color.value ? "border-maritime-gold scale-110 shadow-md" : "border-slate-100"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  
                  {/* Custom Color Picker */}
                  <div className="relative group">
                    <button
                      onClick={() => colorInputRef.current?.click()}
                      className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all overflow-hidden ${
                        !DEFAULT_COLORS.some(c => c.value === layer.props.fill) ? "border-maritime-gold scale-110 shadow-md" : "border-slate-100"
                      }`}
                      title="Custom Color"
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 p-0.5 to-pink-500 flex items-center justify-center">
                         <Pipette size={10} className="text-white" />
                      </div>
                    </button>
                    <input 
                      type="color"
                      ref={colorInputRef}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      value={layer.props.fill || "#000000"}
                      onChange={(e) => onUpdate(layer.id, { fill: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {!isText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opacity</Label>
                <span className="text-[10px] font-black text-maritime-navy">{Math.round((layer.props.opacity ?? 1) * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={(layer.props.opacity ?? 1) * 100}
                onChange={(e) => onUpdate(layer.id, { opacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-maritime-gold h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
          
          {/* Rotation Section */}
          <div className="space-y-4 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <RotateCcw size={14} className="text-maritime-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rotation</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 90, 180, 270].map((angle) => (
                <button
                  key={angle}
                  onClick={() => onUpdate(layer.id, { rotation: angle })}
                  className={`h-10 rounded-xl text-[10px] font-black transition-all ${
                    Math.round(layer.props.rotation || 0) === angle
                      ? "bg-maritime-navy text-white shadow-lg"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
