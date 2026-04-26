"use client"

import { useNotification } from "@modules/common/context/notification-context"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { useState } from "react"
import Spinner from "@modules/common/icons/spinner"
import { Transition } from "@headlessui/react"
import { Fragment } from "react"

export default function UndoNotification() {
  const { state, hideNotification } = useNotification()
  const { countryCode } = useParams()
  const [isRestoring, setIsRestoring] = useState(false)

  const handleUndo = async () => {
    if (!state.item || !countryCode) return

    setIsRestoring(true)
    try {
      await addToCart({
        variantId: state.item.variantId,
        quantity: state.item.quantity,
        countryCode: countryCode as string,
        metadata: state.item.metadata,
      })
      hideNotification()
    } catch (error) {
      console.error("Failed to undo deletion:", error)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="fixed top-24 left-0 w-full z-[60] flex justify-center px-4 pointer-events-none">
      <Transition
        show={state.visible}
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full py-2 px-4 md:px-6 flex items-center gap-4 shadow-xl pointer-events-auto max-w-[90vw] md:max-w-xl">
          <div className="flex-1 min-w-0">
            <p className="text-white text-[10px] md:text-xs font-medium truncate">
              Removed <span className="font-bold">"{state.item?.productTitle}"</span> from cart
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={isRestoring}
              className="bg-maritime-gold text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isRestoring ? <Spinner size={12} /> : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              )}
              Undo
            </button>
            
            <button 
              onClick={hideNotification}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  )
}
