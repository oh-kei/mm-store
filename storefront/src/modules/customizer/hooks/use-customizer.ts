import { useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

export type LayerType = "text" | "image"

export interface LayerProps {
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity?: number
  // Text specific
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  fontWeight?: string
  // Image specific
  url?: string
  originalAsset?: string
}

export interface CustomLayer {
  id: string
  type: LayerType
  props: LayerProps
}

export interface Recipe {
  version: string
  base: {
    productId: string
    variantId: string
    imageUrl: string
    canvasSize: { width: number; height: number }
  }
  layers: CustomLayer[]
}

export const useCustomizer = (initialProduct: { id: string; variantId: string; imageUrl: string }) => {
  const [recipe, setRecipe] = useState<Recipe>({
    version: "1.0",
    base: {
      productId: initialProduct.id,
      variantId: initialProduct.variantId,
      imageUrl: initialProduct.imageUrl,
      canvasSize: { width: 1000, height: 1000 },
    },
    layers: [],
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addTextLayer = useCallback((text = "New Text") => {
    const newLayer: CustomLayer = {
      id: uuidv4(),
      type: "text",
      props: {
        x: 100,
        y: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text,
        fontSize: 40,
        fontFamily: "Panchang",
        fill: "#0F172A", // maritime-navy
        fontWeight: "black",
      },
    }
    setRecipe((prev) => ({ ...prev, layers: [...prev.layers, newLayer] }))
    setSelectedId(newLayer.id)
  }, [])

  const addImageLayer = useCallback((url: string, key: string) => {
    const newLayer: CustomLayer = {
      id: uuidv4(),
      type: "image",
      props: {
        x: 100,
        y: 100,
        rotation: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        url,
        originalAsset: key,
      },
    }
    setRecipe((prev) => ({ ...prev, layers: [...prev.layers, newLayer] }))
    setSelectedId(newLayer.id)
  }, [])

  const updateLayer = useCallback((id: string, newProps: Partial<LayerProps>) => {
    setRecipe((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, props: { ...l.props, ...newProps } } : l)),
    }))
  }, [])

  const removeLayer = useCallback((id: string) => {
    setRecipe((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== id),
    }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  return {
    recipe,
    setRecipe,
    addTextLayer,
    addImageLayer,
    updateLayer,
    removeLayer,
    selectedId,
    setSelectedId,
  }
}
