"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

type NavMenuType = "catalogue" | "region" | "account" | "cart" | "search" | null

interface NavMenuContextType {
  activeMenu: NavMenuType
  setActiveMenu: (menu: NavMenuType) => void
  closeMenu: () => void
}

const NavMenuContext = createContext<NavMenuContextType | undefined>(undefined)

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenuState] = useState<NavMenuType>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setActiveMenuState(null)
  }, [pathname])

  const setActiveMenu = (menu: NavMenuType) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveMenuState(menu)
  }

  const closeMenu = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveMenuState(null)
  }

  return (
    <NavMenuContext.Provider value={{ activeMenu, setActiveMenu, closeMenu }}>
      {children}
    </NavMenuContext.Provider>
  )
}

export function useNavMenu() {
  const context = useContext(NavMenuContext)
  if (!context) throw new Error("useNavMenu must be used within NavMenuProvider")
  return context
}
