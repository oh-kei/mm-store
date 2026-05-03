"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

type NavMenuType = "catalogue" | "region" | "account" | "cart" | "search" | null

interface NavMenuContextType {
  activeMenu: NavMenuType
  isLocked: boolean
  openMenu: (menu: NavMenuType) => void
  closeMenu: (delay?: number) => void
  toggleMenu: (menu: NavMenuType) => void
}

const NavMenuContext = createContext<NavMenuContextType | undefined>(undefined)

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenuState] = useState<NavMenuType>(null)
  const [isLocked, setIsLocked] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Close and unlock on route change
  useEffect(() => {
    setActiveMenuState(null)
    setIsLocked(false)
  }, [pathname])

  const openMenu = (menu: NavMenuType) => {
    if (timerRef.current) {
      console.log(`[NavMenu] Cancelling existing close timer for: ${activeMenu}`)
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setActiveMenuState(prev => {
      if (prev === menu) return prev
      console.log(`[NavMenu] Opening: ${menu}`)
      return menu
    })
  }

  const closeMenu = (delay = 300) => {
    if (isLocked || !activeMenu) {
      if (!isLocked) console.log(`[NavMenu] Close ignored: No active menu`)
      return
    }
    
    if (timerRef.current) clearTimeout(timerRef.current)
    
    const currentMenu = activeMenu
    console.log(`[NavMenu] Starting close timer for: ${currentMenu} (delay: ${delay}ms)`)
    
    timerRef.current = setTimeout(() => {
      setActiveMenuState((prev) => {
        if (prev === currentMenu) {
          console.log(`[NavMenu] Setting activeMenu to null`)
          return null
        }
        return prev
      })
      timerRef.current = null
    }, delay)
  }

  const toggleMenu = (menu: NavMenuType) => {
    console.log(`[NavMenu] Toggling: ${menu} (current active: ${activeMenu}, current lock: ${isLocked})`)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (activeMenu === menu && isLocked) {
      console.log(`[NavMenu] Unlocking and closing`)
      setIsLocked(false)
      setActiveMenuState(null)
    } else {
      console.log(`[NavMenu] Locking open: ${menu}`)
      setActiveMenuState(menu)
      setIsLocked(true)
    }
  }

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Ignore clicks inside the nav bar
      const nav = document.getElementById("main-nav")
      if (nav && nav.contains(e.target as Node)) {
        console.log(`[NavMenu] Click inside nav detected, ignoring outside click handler`)
        return
      }

      if (isLocked) {
        console.log(`[NavMenu] Outside click detected, unlocking`)
        setIsLocked(false)
        setActiveMenuState(null)
      }
    }
    if (isLocked) {
      // Use a tiny timeout to avoid catching the same click that opened the menu
      const timer = setTimeout(() => {
        window.addEventListener("click", handleClickOutside)
      }, 10)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("click", handleClickOutside)
      }
    }
  }, [isLocked])

  return (
    <NavMenuContext.Provider value={{ activeMenu, isLocked, openMenu, closeMenu, toggleMenu }}>
      {children}
    </NavMenuContext.Provider>
  )
}

export function useNavMenu() {
  const context = useContext(NavMenuContext)
  if (!context) throw new Error("useNavMenu must be used within NavMenuProvider")
  return context
}
