"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

interface DeletedItem {
  variantId: string
  quantity: number
  metadata?: Record<string, any>
  productTitle: string
  thumbnail?: string | null
}

interface NotificationState {
  visible: boolean
  item: DeletedItem | null
}

interface NotificationContextType {
  state: NotificationState
  showUndo: (item: DeletedItem) => void
  hideNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NotificationState>({
    visible: false,
    item: null,
  })

  const showUndo = useCallback((item: DeletedItem) => {
    setState({ visible: true, item })
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setState((prev) => {
        if (prev.item?.variantId === item.variantId) {
          return { ...prev, visible: false }
        }
        return prev
      })
    }, 8000)
  }, [])

  const hideNotification = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }))
  }, [])

  return (
    <NotificationContext.Provider value={{ state, showUndo, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
