"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { Heading, Button, Text, clx } from "@medusajs/ui"
import { Plus, Type, Image as ImageIcon, Trash2, ShoppingCart, Layers, MousePointer2, ChevronLeft, Search, HelpCircle, ChevronRight, X } from "lucide-react"
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
import { CrewSelector } from "@modules/bulk-order/components/crew-selector"
import { getCustomer } from "@lib/data/customer"
import { ProductCard } from "@modules/catalog/components/product-card"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import Divider from "@modules/common/components/divider"

// Helper to merge base garment image and transparent design overlay onto a canvas
const mergeImages = (baseImgUrl: string, overlayDataUrl: string, activeView: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const proxiedBaseUrl = `/api/proxy-image?url=${encodeURIComponent(baseImgUrl)}`

    const baseImage = new window.Image()
    baseImage.crossOrigin = "anonymous"
    
    const overlayImage = new window.Image()
    
    let loadedCount = 0
    const checkLoaded = () => {
      loadedCount++
      if (loadedCount === 2) {
        const size = 2000
        canvas.width = size
        canvas.height = size

        // 1. Draw base image
        const scale = Math.min(size / baseImage.width, size / baseImage.height)
        const w = baseImage.width * scale
        const h = baseImage.height * scale
        const x = (size - w) / 2
        const y = (size - h) / 2

        ctx.save()
        if (activeView === "right") {
          ctx.translate(x + w, y)
          ctx.scale(-1, 1)
          ctx.drawImage(baseImage, 0, 0, w, h)
        } else {
          ctx.drawImage(baseImage, x, y, w, h)
        }
        ctx.restore()

        // 2. Draw overlay image
        ctx.drawImage(overlayImage, 0, 0, size, size)

        const mergedDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        resolve(mergedDataUrl)
      }
    }

    baseImage.onload = checkLoaded
    baseImage.onerror = (err) => reject(new Error("Failed to load base image: " + err))
    
    overlayImage.onload = checkLoaded
    overlayImage.onerror = (err) => reject(new Error("Failed to load overlay image: " + err))

    baseImage.src = proxiedBaseUrl
    overlayImage.src = overlayDataUrl
  })
}

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

  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const tutorialSteps = [
    {
      image: "/custom-tutorial-1.webp",
      text: "1: Select a product to customise on the Custom Studio page, or choose 'Customise Design' on a product page."
    },
    {
      image: "/custom-tutorial-2.webp",
      text: "2: Modify your size and colour in the sidebar, if needed."
    },
    {
      image: "/custom-tutorial-3.webp",
      text: "3: Add text or upload logos by clicking 'Text' or 'Logo' respectively. Modify their colour, size, and rotation in the Properties panel."
    },
    {
      image: "/custom-tutorial-4.webp",
      text: "4: Navigate between different views using the Front, Back, Left, and Right buttons, and upload more text or logos if needed. Click 'Add to Cart' to buy individually, or click 'Buy for all crew' to purchase in bulk."
    }
  ]

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

        const findImage = (regex: RegExp) => activeProduct.images?.find(img => {
          const url = img.url?.toLowerCase() || ""
          if (!regex.test(url)) return false
          if (!suffix) {
            if (url.includes("-back") || url.includes("-side")) return false
          }
          return true
        })

        const colorMatch = findImage(pattern) || findImage(simplePattern);

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

        const matchingImage = activeProduct.images.find(img => {
          const url = img.url?.toLowerCase() || ""
          if (!suffix) {
            if (url.includes("-back") || url.includes("-side")) return false
            return true
          }
          return url.includes(suffix)
        });
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
  const { state: isSizingModalOpen, open: openSizingModal, close: closeSizingModal } = useToggleState(false)
  const [crewSelection, setCrewSelection] = useState<{ members: any[], colour: string | null, hasError?: boolean }>({ members: [], colour: null, hasError: false })
  const [roster, setRoster] = useState<any[]>([])
  const [comment, setComment] = useState("")

  useEffect(() => {
    const init = async () => {
      const cust = await getCustomer()
      setCustomer(cust)

      const saved = localStorage.getItem("mm-crew-roster")
      if (saved) {
        try { setRoster(JSON.parse(saved)) } catch (e) { }
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

  const waitForStageLoad = async (expectedView: string, timeout = 3000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (stageRef.current?.isLoaded?.(expectedView)) {
        // Give a short buffer for canvas rendering/Konva setup
        await new Promise(resolve => setTimeout(resolve, 50))
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    return false
  }

  const captureAllPreviews = async () => {
    if (!activeProduct) return {}
    
    const views = ["front"]
    if (activeProduct.images?.some(img => img.url?.toLowerCase().includes("-back"))) {
      views.push("back")
    }
    if (activeProduct.images?.some(img => img.url?.toLowerCase().includes("-side"))) {
      views.push("left", "right")
    }

    const localDataUrls: Record<string, string> = {}

    // Save current view to restore it later
    const originalView = activeView

    // 1. Capture data URLs from canvas sequentially (very fast, no S3 delay)
    for (const view of views) {
      setActiveView(view as any)
      await waitForStageLoad(view)
      const dataUrl = await stageRef.current?.getScreenshot()
      if (dataUrl) {
        localDataUrls[view] = dataUrl
      } else if (view === "right" && localDataUrls["left"]) {
        localDataUrls[view] = localDataUrls["left"]
      }
    }

    // Restore original view immediately so the UI snaps back
    setActiveView(originalView)

    // 2. Upload all captured previews to S3 in parallel (massive speedup)
    const previews: Record<string, string> = {}
    const uploadPromises = Object.keys(localDataUrls).map(async (view) => {
      const dataUrl = localDataUrls[view]
      try {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `preview-${view}-${Date.now()}.jpg`, { type: "image/jpeg" })
        const { publicUrl } = await uploadToS3(file)
        previews[view] = publicUrl
      } catch (err) {
        console.error(`S3 Upload failed for view ${view}`, err)
      }
    })

    await Promise.all(uploadPromises)
    return previews
  }

  const handleAddToCart = async (qty: number = 1) => {
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

  const getBaseImageUrlForColorAndView = (color: string | null, view: string) => {
    if (!activeProduct) return ""

    let suffix = ""
    if (view === "back") suffix = "-back"
    else if (view === "left" || view === "right") suffix = "-side"
    else if (["flag", "banner", "neck scarf"].some(k => activeProduct.title?.toLowerCase().includes(k))) {
      suffix = "-blank"
    }

    if (color) {
      const normalizedColor = color.toLowerCase().replace(/\s+/g, "")
      const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})${suffix}([-_.]|$)`, "i")
      const simplePattern = new RegExp(`${escapedNormalized}`, "i")

      const findImage = (regex: RegExp) => activeProduct.images?.find(img => {
        const url = img.url?.toLowerCase() || ""
        if (!regex.test(url)) return false
        if (!suffix) {
          if (url.includes("-back") || url.includes("-side")) return false
        }
        return true
      })

      const colorMatch = findImage(pattern) || findImage(simplePattern)
      if (colorMatch?.url) {
        return colorMatch.url
      }
    }

    // Fallback: search by view suffix only
    if (activeProduct.images) {
      const matchingImage = activeProduct.images.find(img => {
        const url = img.url?.toLowerCase() || ""
        if (!suffix) {
          if (url.includes("-back") || url.includes("-side")) return false
          return true
        }
        return url.includes(suffix)
      })
      if (matchingImage?.url) {
        return matchingImage.url
      }
    }

    return activeProduct.thumbnail || ""
  }

  const captureAllOverlayPreviews = async () => {
    if (!activeProduct || !stageRef.current) return {}
    
    const views = ["front"]
    if (activeProduct.images?.some(img => img.url?.toLowerCase().includes("-back"))) {
      views.push("back")
    }
    if (activeProduct.images?.some(img => img.url?.toLowerCase().includes("-side"))) {
      views.push("left", "right")
    }

    const overlays: Record<string, string> = {}
    const originalView = activeView

    for (const view of views) {
      setActiveView(view as any)
      await waitForStageLoad(view)
      
      const dataUrl = await stageRef.current.getScreenshot({ hideBase: true, mimeType: "image/png" })
      if (dataUrl) {
        overlays[view] = dataUrl
      } else if (view === "right" && overlays["left"]) {
        overlays[view] = overlays["left"]
      }
    }

    setActiveView(originalView)
    return overlays
  }

  const [isAddingBulk, setIsAddingBulk] = useState(false)

  const handleApplyToCrew = async () => {
    if (!activeProduct || crewSelection.members.length === 0) return

    setIsAddingBulk(true)
    try {
      // 1. Capture transparent overlay previews for each view once
      const overlays = await captureAllOverlayPreviews()
      
      // 2. Identify all unique colors to generate/upload previews for
      const baseColor = crewSelection.colour || selectedOptions["Color"] || selectedOptions["Colour"]
      const colorsToProcess = Array.from(
        new Set(
          crewSelection.members.map(m => {
            const color = m.changeColour || baseColor
            return color ? color : "default"
          })
        )
      )

      // 3. Merge overlays with respective base images and upload to S3 in parallel (massive speedup)
      const colorPreviewsCache: Record<string, Record<string, string>> = {}
      const uploadPromises: Promise<void>[] = []

      for (const color of colorsToProcess) {
        colorPreviewsCache[color] = {}
        for (const view of Object.keys(overlays)) {
          const overlayUrl = overlays[view]
          if (!overlayUrl) continue

          const uploadTask = async () => {
            try {
              const baseImgUrl = getBaseImageUrlForColorAndView(color === "default" ? null : color, view)
              const mergedDataUrl = await mergeImages(baseImgUrl, overlayUrl, view)
              
              const res = await fetch(mergedDataUrl)
              const blob = await res.blob()
              const file = new File([blob], `preview-${color}-${view}-${Date.now()}.jpg`, { type: "image/jpeg" })
              
              const { publicUrl } = await uploadToS3(file)
              colorPreviewsCache[color][view] = publicUrl
            } catch (err) {
              console.error(`Failed to generate/upload preview for color ${color} view ${view}`, err)
            }
          }
          uploadPromises.push(uploadTask())
        }
      }

      await Promise.all(uploadPromises)

      // 4. Add each member to cart with color-accurate custom preview URLs
      for (const member of crewSelection.members) {
        const targetSize = member.changeSize || member.size
        const targetColor = member.changeColour || baseColor

        // Find variant matching size and color
        const variant = activeProduct.variants?.find(v => {
          const hasSize = v.options?.some(o => o.value?.toLowerCase() === targetSize.toLowerCase())
          const hasColor = !targetColor || v.options?.some(o => o.value?.toLowerCase() === targetColor.toLowerCase())
          return hasSize && hasColor
        })

        if (variant) {
          const colorKey = targetColor || "default"
          const memberPreviews = colorPreviewsCache[colorKey] || {}

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
              previews: memberPreviews,
              preview_url: (memberPreviews as any).front || (memberPreviews as any)[activeView] || null,
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

  // Preload base images for the active product
  useEffect(() => {
    if (!activeProduct) return
    const views = ["front", "back", "left", "right"]
    views.forEach(view => {
      const url = getBaseImageUrlForColorAndView(null, view)
      if (url) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
        const img = new window.Image()
        img.src = proxyUrl
      }
    })
  }, [activeProduct])

  // Preload base images for unique crew colors when crew selection changes
  useEffect(() => {
    if (!activeProduct || crewSelection.members.length === 0) return
    
    const baseColor = crewSelection.colour || selectedOptions["Color"] || selectedOptions["Colour"]
    const uniqueColors = Array.from(
      new Set(
        crewSelection.members.map(m => {
          const color = m.changeColour || baseColor
          return color ? color : "default"
        })
      )
    )

    const views = ["front", "back", "left", "right"]
    uniqueColors.forEach(color => {
      views.forEach(view => {
        const url = getBaseImageUrlForColorAndView(color === "default" ? null : color, view)
        if (url) {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
          const img = new window.Image()
          img.src = proxyUrl
        }
      })
    })
  }, [crewSelection, activeProduct, selectedOptions])

  // Warn user before leaving if screenshots are in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAddingToCart || isAddingBulk) {
        e.preventDefault()
        e.returnValue = "Your design previews are still generating. Are you sure you want to leave?"
        return e.returnValue
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isAddingToCart, isAddingBulk])

  // Intercept browser back button and navigation when screenshots are in progress
  useEffect(() => {
    if (!isAddingToCart && !isAddingBulk) return

    // Push a dummy state to history so we have something to pop
    window.history.pushState({ blocking: true }, "", window.location.href)

    const handlePopState = (e: PopStateEvent) => {
      if (isAddingToCart || isAddingBulk) {
        // Push the state again to keep them on this page
        window.history.pushState({ blocking: true }, "", window.location.href)
        alert("Your design previews are still generating. Please do not navigate away until they are complete.")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
      // Clean up the dummy state if we finished successfully without popping it
      if (window.history.state?.blocking) {
        window.history.back()
      }
    }
  }, [isAddingToCart, isAddingBulk])

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
    return products.filter(p => {
      const titleLower = p.title?.toLowerCase() || ""
      if (titleLower.includes("hat clip")) return false
      return titleLower.includes(searchQuery.toLowerCase())
    })
  }, [products, searchQuery])

  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-8 relative">
        {/* Absolute Help Button in top right */}
        <Button
          variant="secondary"
          className="absolute top-32 right-8 p-3 h-12 w-12 rounded-2xl bg-white shadow-sm border-slate-100 hover:border-maritime-gold hover:text-maritime-gold transition-all z-10 flex items-center justify-center"
          onClick={() => {
            setCurrentStep(0)
            setIsTutorialOpen(true)
          }}
          title="View Tutorial"
        >
          <HelpCircle size={24} />
        </Button>

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

        {/* Tutorial Popup Modal */}
        {isTutorialOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsTutorialOpen(false)} />
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 sm:p-8 w-[95vw] md:w-[90vw] max-w-5xl h-[90vh] max-h-[850px] relative z-10 flex flex-col items-center justify-between gap-6 animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button 
                onClick={() => setIsTutorialOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 z-30"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center w-full shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maritime-gold">Tutorial</span>
                <h3 className="text-xl font-medium text-slate-900 tracking-tight mt-1">Custom Studio Guide</h3>
              </div>

              {/* Carousel Content */}
              <div className="w-full flex-grow flex flex-col items-center gap-4 min-h-0">
                <div className="relative w-full flex-grow overflow-hidden flex items-center justify-center min-h-0">
                  <img 
                    src={tutorialSteps[currentStep].image} 
                    alt={`Tutorial step ${currentStep + 1}`} 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />

                  {/* Left Arrow */}
                  {currentStep > 0 && (
                    <button 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}

                  {/* Right Arrow */}
                  {currentStep < tutorialSteps.length - 1 && (
                    <button 
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}
                </div>

                {/* Step indicator dots */}
                <div className="flex gap-2 mt-1 shrink-0">
                  {tutorialSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={clx(
                        "h-2 rounded-full transition-all duration-300",
                        currentStep === idx ? "w-8 bg-maritime-gold" : "w-2 bg-slate-200 hover:bg-slate-300"
                      )}
                    />
                  ))}
                </div>

                {/* Text Description */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 w-full shrink-0 flex items-center justify-center text-center min-h-[90px]">
                  <p className="text-[12px] sm:text-sm font-semibold leading-relaxed text-slate-600 max-w-2xl">
                    {tutorialSteps[currentStep].text}
                  </p>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-4 w-full border-t border-slate-100 pt-4 shrink-0">
                {currentStep < tutorialSteps.length - 1 ? (
                  <button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 bg-slate-900 text-white rounded-xl h-12 font-medium text-xs hover:bg-slate-800 transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsTutorialOpen(false)}
                    className="flex-1 bg-maritime-gold text-maritime-navy rounded-xl h-12 font-semibold text-xs hover:bg-yellow-500 transition-colors"
                  >
                    Got It!
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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

      {/* Absolute Help Button in top right */}
      <Button
        variant="secondary"
        className="absolute top-32 right-8 p-3 h-12 w-12 rounded-2xl bg-white shadow-sm border-slate-100 hover:border-maritime-gold hover:text-maritime-gold transition-all z-10 flex items-center justify-center"
        onClick={() => {
          setCurrentStep(0)
          setIsTutorialOpen(true)
        }}
        title="View Tutorial"
      >
        <HelpCircle size={24} />
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
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*,.svg,.ai" disabled={isUploading} />
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
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedId === layer.id
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
              {(() => {
                const titleLower = activeProduct.title?.toLowerCase() || ""
                const hasNoSizingGuide =
                  titleLower.includes("hat clip") ||
                  titleLower.includes("banner") ||
                  titleLower.includes("flag") ||
                  titleLower.includes("neck scarf") ||
                  titleLower.includes("duffel")

                if (hasNoSizingGuide) return null;
                return (
                  <button
                    onClick={openSizingModal}
                    className="mt-3 text-[10px] font-semibold text-maritime-navy hover:text-maritime-gold transition-colors flex items-center gap-1.5 underline underline-offset-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" /></svg>
                    Sizing Guide
                  </button>
                )
              })()}
            </div>

            {/* Options Selectors */}
            <div className="space-y-6">
              {activeProduct.options?.map((option) => {
                const values = option.values || []
                const isSize = (option.title || "").toLowerCase().includes("size")
                const sortedValues = isSize 
                  ? [...values].sort((a, b) => {
                      const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl", "5xl"]
                      const valA = (a.value || "").toLowerCase()
                      const valB = (b.value || "").toLowerCase()
                      const indexA = SIZE_ORDER.indexOf(valA)
                      const indexB = SIZE_ORDER.indexOf(valB)
                      if (indexA !== -1 && indexB !== -1) return indexA - indexB
                      if (indexA !== -1) return -1
                      if (indexB !== -1) return 1
                      return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
                    })
                  : values

                return (
                  <div key={option.id} className="space-y-3">
                    <span className="text-[10px] font-medium text-slate-400">{option.title}</span>
                    <div className="flex flex-wrap gap-2">
                      {sortedValues.map((v) => (
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
                )
              })}
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
                    <span>Add Design to Cart</span>
                  </>
                )}
              </Button>

              {customer && !["flag", "banner"].some(k => activeProduct.title?.toLowerCase().includes(k)) && (
                <Button
                  onClick={openCrewModal}
                  disabled={isAddingToCart || isAddingBulk || roster.length === 0}
                  variant="secondary"
                  className="w-full h-12 mt-3 bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-900 rounded-2xl font-medium text-xs flex items-center justify-center gap-3 group transition-all"
                >
                  <Users size={16} className="text-maritime-gold group-hover:scale-110 transition-transform" />
                  <span>Buy for all crew</span>
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Crew Selection Modal */}
      <Modal isOpen={isCrewModalOpen} close={closeCrewModal} size="large" className="max-h-[90vh]">
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

      {/* Sizing Guide Modal */}
      <Modal isOpen={isSizingModalOpen} close={closeSizingModal} size="large">
        <Modal.Title>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-maritime-navy/10 flex items-center justify-center text-maritime-navy">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" /></svg>
            </div>
            <div>
              <Heading className="text-xl font-medium tracking-tight text-slate-900">Sizing Guide</Heading>
              <Text className="text-[10px] font-medium text-slate-400">Find the perfect fit for {activeProduct.title}</Text>
            </div>
          </div>
        </Modal.Title>
        <Modal.Body>
          <div data-lenis-prevent className="py-4 flex justify-center bg-white rounded-2xl p-4 border border-slate-100 shadow-inner">
            {activeProduct.images?.find(img => img.url?.toLowerCase().includes("-sizing"))?.url ? (
              <img
                src={activeProduct.images?.find(img => img.url?.toLowerCase().includes("-sizing"))?.url}
                alt="Sizing Guide"
                className="max-w-full max-h-[50vh] h-auto object-contain rounded-xl"
              />
            ) : (
              <div className="text-small-regular text-slate-400 py-12 italic">
                No sizing guide image available for this product.
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end w-full">
            <Button onClick={closeSizingModal} className="h-12 px-6 rounded-xl font-medium text-[10px] bg-maritime-navy text-white cursor-pointer">
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {(isAddingToCart || isAddingBulk) && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-maritime-gold/20 animate-ping w-16 h-16" />
              <div className="relative w-16 h-16 border-4 border-maritime-gold border-t-transparent rounded-full animate-spin flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-maritime-gold animate-pulse"><path d="M23 19a2 2 0 0 1-3.5 1.5l-3.9-3.9a3.5 3.5 0 1 1 2.8-2.8l3.9 3.9c.7.7.7 1.8 0 2.5z"/><circle cx="11" cy="11" r="8"/></svg>
              </div>
            </div>
            <div className="space-y-2">
              <Heading className="text-xl font-bold text-slate-900">
                {isAddingBulk ? "Saving Crew Designs..." : "Generating Previews..."}
              </Heading>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {isAddingBulk 
                  ? "We are generating and saving unique previews for each crew member's color choice. Please do not close or navigate away."
                  : "We are preparing high-resolution preview images of your custom design. This will only take a moment."
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Popup Modal */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Click outside backdrop to close */}
          <div className="absolute inset-0" onClick={() => setIsTutorialOpen(false)} />
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 sm:p-8 w-[95vw] md:w-[90vw] max-w-5xl h-[90vh] max-h-[850px] relative z-10 flex flex-col items-center justify-between gap-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsTutorialOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 z-30"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center w-full shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maritime-gold">Tutorial</span>
              <h3 className="text-xl font-medium text-slate-900 tracking-tight mt-1">Custom Studio Guide</h3>
            </div>

            {/* Carousel Content */}
            <div className="w-full flex-grow flex flex-col items-center gap-4 min-h-0">
              <div className="relative w-full flex-grow overflow-hidden flex items-center justify-center min-h-0">
                <img 
                  src={tutorialSteps[currentStep].image} 
                  alt={`Tutorial step ${currentStep + 1}`} 
                  className="w-full h-full object-contain mix-blend-multiply"
                />

                {/* Left Arrow */}
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {/* Right Arrow */}
                {currentStep < tutorialSteps.length - 1 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg p-3 rounded-full transition-all hover:scale-105 z-20"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>

              {/* Step indicator dots */}
              <div className="flex gap-2 mt-1 shrink-0">
                {tutorialSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={clx(
                      "h-2 rounded-full transition-all duration-300",
                      currentStep === idx ? "w-8 bg-maritime-gold" : "w-2 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>

              {/* Text Description */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 w-full shrink-0 flex items-center justify-center text-center min-h-[90px]">
                <p className="text-[12px] sm:text-sm font-semibold leading-relaxed text-slate-600 max-w-2xl">
                  {tutorialSteps[currentStep].text}
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-4 w-full border-t border-slate-100 pt-4 shrink-0">
              {currentStep < tutorialSteps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex-1 bg-slate-900 text-white rounded-xl h-12 font-medium text-xs hover:bg-slate-800 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={() => setIsTutorialOpen(false)}
                  className="flex-1 bg-maritime-gold text-maritime-navy rounded-xl h-12 font-semibold text-xs hover:bg-yellow-500 transition-colors"
                >
                  Got It!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
