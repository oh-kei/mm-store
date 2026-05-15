"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import "./nav.css"

export default function InteractiveNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/' || /^\/[a-z]{2}$/i.test(pathname)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // If we scroll past the hero image (which is 100vh)
      if (window.scrollY > window.innerHeight - 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    if (isHome) {
      window.addEventListener("scroll", handleScroll)
      handleScroll() // Trigger once on mount
      return () => window.removeEventListener("scroll", handleScroll)
    } else {
      setIsScrolled(true) // Always solid on non-home pages
    }
  }, [isHome])

  const isSolid = !isHome || isScrolled;

  return (
    <div className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 pointer-events-none ${isSolid ? 'nav-solid' : 'nav-transparent'}`}>
       {children}
    </div>
  )
}
