"use client"

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

type NavMenuType = "catalogue" | "region" | "account" | "cart" | "search" | null

interface NavMenuContextType {
  activeMenu: NavMenuType
  isLocked: boolean
  isScrolled: boolean
  openMenu: (menu: NavMenuType) => void
  closeMenu: (delay?: number) => void
  toggleMenu: (menu: NavMenuType) => void
}

const NavMenuContext = createContext<NavMenuContextType | undefined>(undefined)

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenuState] = useState<NavMenuType>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setActiveMenuState(null)
  }, [pathname])

  // Scroll detection
  useEffect(() => {
    const isHome = pathname === '/' || /^\/[a-z]{2}\/?$/i.test(pathname)
    
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    if (isHome) {
      window.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll()
      return () => window.removeEventListener("scroll", handleScroll)
    } else {
      setIsScrolled(true)
    }
  }, [pathname])

  const openMenu = (menu: NavMenuType) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setActiveMenuState(prev => {
      if (prev === menu) return prev
      return menu
    })
  }

  const closeMenu = (delay = 300) => {
    if (!activeMenu) return
    
    if (timerRef.current) clearTimeout(timerRef.current)
    
    const currentMenu = activeMenu
    
    timerRef.current = setTimeout(() => {
      setActiveMenuState((prev) => {
        if (prev === currentMenu) {
          return null
        }
        return prev
      })
      timerRef.current = null
    }, delay)
  }

  const toggleMenu = (menu: NavMenuType) => {
    // For legacy support or mobile if needed, but no locking
    setActiveMenuState(prev => prev === menu ? null : menu)
  }

  return (
    <NavMenuContext.Provider value={{ activeMenu, isLocked: false, isScrolled, openMenu, closeMenu, toggleMenu }}>
      {children}
    </NavMenuContext.Provider>
  )
}

export function useNavMenu() {
  const context = useContext(NavMenuContext)
  if (!context) throw new Error("useNavMenu must be used within NavMenuProvider")
  return context
}
