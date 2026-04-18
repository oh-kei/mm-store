"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { RosterTable } from "../components/roster-table"
import { CSVUploader } from "../components/csv-uploader"
import { ManualAddMember } from "../components/manual-add-member"
import { BulkCatalog } from "../components/bulk-catalog"
import MailingList from "../components/mailing-list"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import { getCustomer, updateCustomer } from "@lib/data/customer"
import { addBulkToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"

interface PortalContainerProps {
  products: HttpTypes.StoreProduct[]
}

interface CrewMember {
  name: string
  size: string
  warning?: string
}

export function PortalContainer({ products }: PortalContainerProps) {
  const searchParams = useSearchParams()
  const section = searchParams.get("section") || "roster"
  
  const [roster, setRoster] = useState<CrewMember[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load roster and customer on mount
  useEffect(() => {
    const initPortal = async () => {
      const cust = await getCustomer()
      setCustomer(cust)

      if (cust?.metadata?.roster) {
        try {
          const loadedRoster = JSON.parse(cust.metadata.roster as string)
          setRoster(loadedRoster)
          localStorage.setItem("mm-crew-roster", JSON.stringify(loadedRoster))
        } catch (e) {
          console.error("Failed to parse metadata roster")
        }
      } else {
        const saved = localStorage.getItem("mm-crew-roster")
        if (saved) {
           try { setRoster(JSON.parse(saved)) } catch(e) {}
        }
      }
    }
    initPortal()
  }, [])

  // Sync roster to Medusa Metadata
  const syncRoster = async (updatedRoster: CrewMember[]) => {
    if (!customer) return // Only sync if logged in
    
    setIsSyncing(true)
    try {
      await updateCustomer({
        metadata: {
          roster: JSON.stringify(updatedRoster)
        }
      })
      localStorage.setItem("mm-crew-roster", JSON.stringify(updatedRoster))
    } catch (e) {
      console.error("Failed to sync roster to server")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRosterUpload = (data: { name: string; size: string }[]) => {
    if (!customer) {
      setErrorMsg("Please sign in to manage your crew roster.")
      return
    }
    
    const updated = [...roster]
    data.forEach(item => {
      const isDuplicate = roster.some(m => m.name.toLowerCase() === item.name.toLowerCase())
      updated.push({
        ...item,
        warning: isDuplicate ? "duplicate name" : undefined
      })
    })
    
    setRoster(updated)
    syncRoster(updated)
  }

  const handleManualAdd = (member: { name: string; size: string }) => {
    if (!customer) {
      setErrorMsg("Please sign in to manage your crew roster.")
      return
    }
    
    const isDuplicate = roster.some(m => m.name.toLowerCase() === member.name.toLowerCase())
    const updated = [...roster, { ...member, warning: isDuplicate ? "duplicate name" : undefined }]
    
    setRoster(updated)
    syncRoster(updated)
  }

  const handleClearWarning = (idx: number) => {
    const updated = [...roster]
    if (updated[idx]) {
      const { warning, ...rest } = updated[idx]
      updated[idx] = rest
      setRoster(updated)
      syncRoster(updated)
    }
  }

  const handleRemoveMember = (idx: number) => {
    if (!customer) {
      setErrorMsg("Please sign in to manage your crew roster.")
      return
    }
    const updated = roster.filter((_, i) => i !== idx)
    setRoster(updated)
    syncRoster(updated)
  }

  const handleUpdateMember = (idx: number, member: CrewMember) => {
    if (!customer) {
      setErrorMsg("Please sign in to manage your crew roster.")
      return
    }
    const updated = [...roster]
    updated[idx] = member
    setRoster(updated)
    syncRoster(updated)
  }

  const countryCode = useParams().countryCode as string

  const handleAddToCart = async (productId: string, selection: { members: any[], color: string | null }) => {
     if (!customer) {
       setErrorMsg("Sign in required to add bulk items to the cart.")
       return
     }

     if (selection.members.length === 0) {
       setErrorMsg("Please select at least one crew member.")
       return
     }

     const allHaveColour = selection.members.every(m => m.overrideColour || selection.colour)
     if (!allHaveColour) {
       setErrorMsg("Please select a colour for all members (either globally or via override).")
       return
     }

     const product = products.find(p => p.id === productId)
     if (!product) return

     const itemsToAdd: { variantId: string, quantity: number }[] = []

     selection.members.forEach(member => {
       // Priority: Member Override > Global Selection > Roster Default
       const targetColour = member.overrideColour || selection.colour
       const targetSize = member.overrideSize || member.size

       if (!targetColour) {
         // This shouldn't happen with our UI guards but safety first
         return
       }

       // Find variant matching colour AND size
       const variant = product.variants?.find(v => {
         const hasColour = v.options?.some(o => o.value?.toLowerCase() === targetColour.toLowerCase())
         const hasSize = v.options?.some(o => o.value?.toLowerCase() === targetSize.toLowerCase())
         return hasColour && hasSize
       })

       if (variant?.id) {
         // Check if we already have this variant in itemsToAdd, if so increment quantity
         const existing = itemsToAdd.find(i => i.variantId === variant.id)
         if (existing) {
           existing.quantity += 1
         } else {
           itemsToAdd.push({ variantId: variant.id, quantity: 1 })
         }
       } else {
         console.warn(`No variant found for ${product.title} in colour ${targetColour} and size ${targetSize}`)
       }
     })

     if (itemsToAdd.length === 0) {
       setErrorMsg("No matching variants found for the selected crew sizes.")
       return
     }

     try {
       setIsSyncing(true)
       await addBulkToCart({
         items: itemsToAdd,
         countryCode
       })
       setSuccessMsg(`Successfully added ${selection.members.length} items to cart!`)
     } catch (e) {
       console.error("Bulk add failed", e)
       setErrorMsg("Failed to add items to cart. Please try again.")
     } finally {
       setIsSyncing(false)
     }
  }

  // Group and sort products by category
  const sortedProducts = [...products].sort((a, b) => {
    const catA = a.categories?.[0]?.name || "Uncategorized"
    const catB = b.categories?.[0]?.name || "Uncategorized"
    return catA.localeCompare(catB)
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {section === "roster" && (
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Heading className="text-4xl font-black uppercase tracking-tight text-slate-900">Add Crew</Heading>
              {isSyncing && <span className="text-[10px] font-black uppercase tracking-widest text-maritime-gold animate-pulse">Syncing...</span>}
            </div>
            <ManualAddMember onAdd={handleManualAdd} />
            <CSVUploader onUpload={handleRosterUpload} />
          </div>
          
          {roster.length > 0 && (
            <div className="space-y-6">
              <Heading className="text-4xl font-black uppercase tracking-tight text-slate-900">Active Crew List</Heading>
              <RosterTable 
                members={roster} 
                onRemove={handleRemoveMember} 
                onUpdate={handleUpdateMember} 
                onClearWarning={handleClearWarning}
              />
            </div>
          )}
        </div>
      )}

      {section === "catalog" && (
        <BulkCatalog 
          products={sortedProducts} 
          roster={roster} 
          customer={customer}
          onAddToCart={handleAddToCart} 
        />
      )}

      {errorMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div>
              <Heading className="text-xl font-black uppercase tracking-tight text-slate-900">Notice</Heading>
              <p className="text-sm font-bold text-slate-500 mt-2">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="w-full bg-slate-900 text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="bg-green-50 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <Heading className="text-xl font-black uppercase tracking-tight text-slate-900">Success</Heading>
              <p className="text-sm font-bold text-slate-500 mt-2">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="w-full bg-maritime-gold text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 transition-colors">
              Continue
            </button>
          </div>
        </div>
      )}


    </div>
  )
}
