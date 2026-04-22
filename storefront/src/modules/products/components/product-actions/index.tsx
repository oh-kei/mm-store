"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
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
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const { handleVariantChange, handleColorChange } = useProductGallery()

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

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!customer) return null
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
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

        <ProductPrice product={product} variant={selectedVariant} />

        {!customer ? (
          <LocalizedClientLink href="/account">
            <Button
              variant="primary"
              className="w-full h-10 uppercase font-black tracking-widest text-[10px]"
            >
              Sign in to purchase
            </Button>
          </LocalizedClientLink>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            variant="primary"
            className="w-full h-10 uppercase font-black tracking-widest text-[10px]"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : "Add to cart"}
          </Button>
        )}

        {customer && (
          <div className="mt-4">
            <LocalizedClientLink href={`/custom-studio?id=${product.id}`}>
              <Button
                variant="secondary"
                className="w-full h-12 uppercase font-black tracking-widest text-[10px] border-slate-200 hover:bg-slate-50 hover:border-maritime-gold transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.5 1.5-1.3 0-.4-.1-.8-.3-1.2-.1-.4-.1-.7.1-1 .3-.3.7-.5 1.1-.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-10-10-10z"/></svg>
                <span>Customize Design</span>
              </Button>
            </LocalizedClientLink>
          </div>
        )}
        {customer && (
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
        )}
      </div>
    </>
  )
}
