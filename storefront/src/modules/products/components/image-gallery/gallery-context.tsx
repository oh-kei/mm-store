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

  // Helper to find an image by color pattern in filename (e.g. -Black-)
  const findImageByColorPattern = useCallback((color: string) => {
    if (!color) return null
    
    const normalizedColor = color.toLowerCase().replace(/\s+/g, "")
    const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Pattern to match color in filename:
    // Preceded by a dash or underscore
    // Followed by a dash, underscore, dot, or end of string
    const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})([-_.]|$)`, "i")
    
    // Find first image matching the pattern
    const matchIndex = images.findIndex((img) => pattern.test(img.url || ""))
    
    if (matchIndex !== -1) {
      console.log(`[Color Match] Found image for "${color}" at index ${matchIndex}: ${images[matchIndex].url}`)
      return matchIndex
    }
    
    console.warn(`[Color Match] No image found matching pattern for "${color}" in product images.`)
    return null
  }, [images])

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
    console.log(`[Color Change] Started for color: "${colorValue}"`)
    
    const matchIndex = findImageByColorPattern(colorValue)
    if (matchIndex !== null) {
      setActiveIndex(matchIndex)
    }
  }, [findImageByColorPattern])

  return (
    <ProductGalleryContext.Provider value={{ activeIndex, setActiveIndex, handleVariantChange, handleColorChange }}>
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
