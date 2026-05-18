"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface ProductGalleryContextType {
  activeIndex: number
  setActiveIndex: (index: number) => void
  handleVariantChange: (variant: any) => void
  handleColorChange: (colorValue: string, product: any) => void
}

const ProductGalleryContext = createContext<ProductGalleryContextType | undefined>(undefined)

export const ProductGalleryProvider: React.FC<{ children: React.ReactNode, images: any[] }> = ({ children, images }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  // Filter out side and back images exactly like the gallery component does
  const filteredImages = React.useMemo(() => {
    return images.filter(img => !img.url?.includes("-side") && !img.url?.includes("-back"))
  }, [images])

  // Helper to find an image by color pattern in filename (e.g. -Black-)
  const findImageByColorPattern = useCallback((color: string) => {
    if (!color) return null
    
    const normalizedColor = color.toLowerCase().replace(/\s+/g, "")
    const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 1. Strict boundary-safe pattern (matches color preceded by slash, dash, underscore or start,
    // and followed by dash, underscore, dot or end)
    const strictPattern = new RegExp(`([/\\-_]|^)(${escapedColor}|${escapedNormalized})([\\-_.]|$)`, "i")
    let matchIndex = filteredImages.findIndex((img) => strictPattern.test(img.url || ""))
    
    // 2. Loose fallback case-insensitive substring search for maximum compatibility across all naming styles
    if (matchIndex === -1) {
      matchIndex = filteredImages.findIndex((img) => 
        (img.url || "").toLowerCase().includes(color.toLowerCase()) || 
        (img.url || "").toLowerCase().includes(normalizedColor)
      )
    }
    
    if (matchIndex !== -1) {
      return matchIndex
    }
    
    return null
  }, [filteredImages])

  const handleVariantChange = useCallback((variant: any) => {
    if (!variant) return

    // Find the current variant's Color option
    const colorOption = variant.options?.find((o: any) => {
      const title = o.title || o.option?.title
      return title?.toLowerCase() === "color" || title?.toLowerCase() === "colour"
    })

    if (colorOption?.value) {
      const matchIndex = findImageByColorPattern(colorOption.value)
      if (matchIndex !== null) {
        setActiveIndex(matchIndex)
      }
    }
  }, [findImageByColorPattern])

  const handleColorChange = useCallback((colorValue: string, product: any) => {
    const matchIndex = findImageByColorPattern(colorValue)
    if (matchIndex !== null) {
      setActiveIndex(matchIndex)
    }
  }, [findImageByColorPattern])

  const value = React.useMemo(() => ({ 
    activeIndex, 
    setActiveIndex, 
    handleVariantChange, 
    handleColorChange 
  }), [activeIndex, setActiveIndex, handleVariantChange, handleColorChange])

  return (
    <ProductGalleryContext.Provider value={value}>
      {children}
    </ProductGalleryContext.Provider>
  )
}

export const useProductGallery = () => {
  const context = useContext(ProductGalleryContext)
  if (context === undefined) {
    throw new Error("useProductGallery must be used within a ProductGalleryProvider")
  }
  return context
}
