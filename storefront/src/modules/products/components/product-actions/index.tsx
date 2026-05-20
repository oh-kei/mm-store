"use client"

import { Button } from "@medusajs/ui"
import isEqual from "lodash/isEqual"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useProductGallery } from "../image-gallery/gallery-context"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  customer?: HttpTypes.StoreCustomer | null
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  customer,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState<string | number>(1)
  const countryCode = useParams().countryCode as string
  const searchParams = useSearchParams()
  const prevProductIdRef = useRef<string | null>(null)
  const hasPreselectedRef = useRef(false)

  const { handleVariantChange, handleColorChange } = useProductGallery()

  // Preselect options if there's only one choice available for that option
  useEffect(() => {
    // Only run this once per product to avoid infinite loops with the context
    if (prevProductIdRef.current === product.id && hasPreselectedRef.current) {
      return
    }
    
    prevProductIdRef.current = product.id
    hasPreselectedRef.current = true

    // If there's only one variant, preselect all its options
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
      return
    }

    // Otherwise, check each option and preselect if it only has one value
    const newOptions = { ...options }
    let changed = false
    const urlColor = searchParams.get("color")

    product.options?.forEach((option) => {
      const optionTitle = option.title ?? ""
      
      // If color is in URL, preselect it
      if ((optionTitle.toLowerCase().includes("color") || optionTitle.toLowerCase().includes("colour")) && urlColor) {
        const matchingValue = option.values?.find(v => v.value?.toLowerCase() === urlColor.toLowerCase())
        if (matchingValue && !newOptions[optionTitle]) {
          newOptions[optionTitle] = matchingValue.value
          changed = true
          handleColorChange(matchingValue.value, product)
          return
        }
      }

      if (option.values?.length === 1) {
        const optionValue = option.values[0].value ?? undefined
        
        if (optionValue && !newOptions[optionTitle]) {
          newOptions[optionTitle] = optionValue
          changed = true
          
          // Also trigger handleColorChange if it's a color option
          if (optionTitle.toLowerCase() === "color" || optionTitle.toLowerCase() === "colour") {
            handleColorChange(optionValue, product)
          }
        }
      }
    })

    if (changed) {
      setOptions(newOptions)
    }
  }, [product.options, product.variants, product.id, handleColorChange])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])



  useEffect(() => {
    if (selectedVariant) {
      handleVariantChange(selectedVariant)
    }
  }, [selectedVariant, handleVariantChange])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))

    // Use the precise color mapping logic when selecting a color
    if (title.toLowerCase() === "color" || title.toLowerCase() === "colour") {
      handleColorChange(value, product)
    }
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const requiresCustomization = useMemo(() => {
    const title = product.title?.toLowerCase() || ""
    if (title.includes("hat clip")) return false
    return ["flag", "banner"].some(k => title.includes(k))
  }, [product.title])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: Number(quantity),
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      onMouseEnter={(title, value) => {
                        if (title.toLowerCase() === "color" || title.toLowerCase() === "colour") {
                          handleColorChange(value, product)
                          return
                        }

                        const tempOptions = { ...options, [title]: value }
                        const tempVariant = product.variants?.find((v) => {
                          const variantOptions = optionsAsKeymap(v.options)
                          return isEqual(variantOptions, tempOptions)
                        })
                        if (tempVariant) {
                          handleVariantChange(tempVariant)
                        } else {
                          // If no direct map, find ANY variant with that value to show at least something
                          const fallbackVariant = product.variants?.find((v) => {
                            return v.options?.some(opt => opt.option?.title === title && opt.value === value)
                          })
                          if (fallbackVariant) handleVariantChange(fallbackVariant)
                        }
                      }}
                      onMouseLeave={() => {
                        if (selectedVariant) handleVariantChange(selectedVariant)
                      }}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <ProductPrice product={product} variant={selectedVariant} />
          
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm h-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => q > 1 ? q - 1 : 1) }}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-maritime-navy transition-colors font-bold text-lg"
            >
              -
            </button>
            <input 
              type="text" 
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity("");
                  return;
                }
                const num = parseInt(val);
                if (!isNaN(num) && num > 0 && num <= 99) {
                  setQuantity(num);
                }
              }}
              onBlur={() => {
                if (quantity === "" || isNaN(Number(quantity))) {
                  setQuantity(1);
                }
              }}
              className="w-12 h-full text-center text-xs font-bold text-maritime-navy focus:outline-none p-0 border-none bg-transparent"
            />
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => q < 99 ? q + 1 : q) }}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-maritime-navy transition-colors font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding || requiresCustomization}
          variant="primary"
          className="w-full h-10 bg-slate-100 hover:bg-maritime-navy text-slate-900 hover:text-white border-none font-medium tracking-widest text-[10px] transition-all"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : requiresCustomization
            ? "Customize to Purchase"
            : !inStock
            ? "Out of stock"
            : "Add to cart"}
        </Button>

        {!product.title?.toLowerCase().includes("hat clip") && (
          <div className="mt-4">
            <LocalizedClientLink href={`/custom-studio?id=${product.id}${options["Color"] ? `&color=${encodeURIComponent(options["Color"])}` : (options["Colour"] ? `&color=${encodeURIComponent(options["Colour"])}` : "")}`}>
              <Button
                variant="secondary"
                className="w-full h-12 font-medium tracking-widest text-[10px] bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-900 transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.5 1.5-1.3 0-.4-.1-.8-.3-1.2-.1-.4-.1-.7.1-1 .3-.3.7-.5 1.1-.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-10-10-10z"/></svg>
                <span>Customize Design</span>
              </Button>
            </LocalizedClientLink>
          </div>
        )}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
