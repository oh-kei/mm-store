"use client"

import { Table, Text, clx } from "@medusajs/ui"

import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState, useRef, useMemo } from "react"
import { useNotification } from "@modules/common/context/notification-context"
import { useParams } from "next/navigation"
import { getVariantImage } from "@modules/products/utils/get-variant-image"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMoreRange, setShowMoreRange] = useState(item.quantity > 10)
  const [isManualMode, setIsManualMode] = useState(item.quantity > 10)
  const [manualQty, setManualQty] = useState(item.quantity.toString())
  
  const { showUndo } = useNotification()
  const { countryCode } = useParams()

  const { handle } = item.variant?.product ?? {}

  const handleDelete = async () => {
    setError(null)
    setUpdating(true)
    
    // Store item data for undo before deleting
    const itemData = {
      variantId: item.variant_id!,
      quantity: item.quantity,
      metadata: item.metadata || undefined,
      productTitle: item.product_title || "Item",
      thumbnail: item.variant?.product?.thumbnail,
    }

    try {
      await deleteLineItem(item.id)
      showUndo(itemData)
    } catch (err: any) {
      setError(err.message)
      setUpdating(false)
    }
  }

  const variantImage = useMemo(() => getVariantImage(item.variant), [item.variant])

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={variantImage || item.variant?.product?.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <>
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
          {!!item.metadata?.recipe && (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-maritime-gold/10 text-maritime-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-maritime-gold/20">
                Custom
              </span>
              {!!item.metadata?.crew_member && (
                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  For: {item.metadata.crew_member as string}
                </span>
              )}
            </div>
          )}
        </>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex items-center gap-x-2 md:gap-x-3 w-fit md:w-28">
            {/* Desktop: Step buttons */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-md bg-gray-50/50">
              <button
                onClick={() => {
                  if (item.quantity > 1) {
                    changeQuantity(item.quantity - 1)
                  } else {
                    handleDelete()
                  }
                }}
                disabled={updating}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <div className="w-8 flex items-center justify-center">
                <span className="text-xs font-bold font-sans">
                  {updating ? <Spinner size={14} /> : item.quantity}
                </span>
              </div>
              <button
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= maxQuantity || updating}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>

            {/* Mobile: Hybrid Quantity Selector */}
            <div className="flex md:hidden items-center gap-1.5">
              {!isManualMode ? (
                <div className="relative group">
                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50/50 hover:bg-white hover:border-black transition-all duration-200 shadow-sm overflow-hidden">
                    <select
                      value={item.quantity > 10 ? item.quantity : item.quantity}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === "more") {
                          setIsManualMode(true)
                        } else {
                          const numVal = parseInt(val)
                          if (numVal === 0) {
                            handleDelete()
                          } else {
                            changeQuantity(numVal)
                          }
                        }
                      }}
                      disabled={updating}
                      className="appearance-none bg-transparent w-10 h-7 pl-2.5 pr-4 text-[10px] font-extrabold outline-none cursor-pointer text-center"
                    >
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>{i === 0 ? "0 (Remove)" : i}</option>
                      ))}
                      {item.quantity > 10 && (
                        <option value={item.quantity}>{item.quantity}</option>
                      )}
                      <option value="more">Other</option>
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm overflow-hidden h-7 animate-in fade-in zoom-in duration-200">
                  <input
                    type="number"
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseInt(manualQty)
                        if (!isNaN(val) && val > 0) {
                          changeQuantity(val)
                          setIsManualMode(false)
                        }
                      }
                    }}
                    className="w-10 h-full text-[10px] font-bold text-center outline-none border-r border-gray-100"
                    min="1"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(manualQty)
                      if (!isNaN(val) && val > 0) {
                        changeQuantity(val)
                        setIsManualMode(false)
                      } else if (val === 0) {
                        handleDelete()
                      }
                    }}
                    disabled={updating}
                    className="px-2 h-full flex items-center justify-center bg-black hover:bg-maritime-gold transition-colors group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-black transition-colors"><path d="M20 6 9 17l-5-5"/></svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsManualMode(false)
                      setManualQty(item.quantity.toString())
                    }}
                    className="px-1.5 h-full flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors border-l border-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDelete}
              disabled={updating}
              className="text-gray-400 hover:text-ui-fg-interactive transition-colors"
              aria-label="Remove item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice item={item} style="tight" />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
          )}
          <LineItemPrice item={item} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
