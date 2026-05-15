"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import "./styles.css"

// The simplified paths: just full screen, a curved midpoint, and completely hidden
const paths = {
  // Screen is entirely covered, flat edges (X = 100)
  filled: "M 0 0 L 100 0 C 100 50 100 50 100 100 L 0 100 L 0 0 Z",
  // Shrinking left, right edge bows outward into a smooth curve (X = 50)
  inBetween: "M 0 0 L 50 0 C 22 43 46 81 50 100 L 0 100 L 0 0 Z",
  // Shrunk entirely to the left edge, completely invisible (X = 0)
  unfilled: "M 0 0 L 0 0 C 0 50 0 50 0 100 L 0 100 L 0 0 Z",
}

const peelAwayAnimation: Variants = {
  initial: { d: paths.unfilled },
  enter: {
    d: paths.filled,
    transition: { duration: 0 },
  },
  exit: (customDelay: number) => ({
    d: [paths.filled, paths.inBetween, paths.unfilled],
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      times: [0, 0.2, 1],
      delay: customDelay,
    },
  }),
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/' || /^\/[a-z]{2}$/i.test(pathname)
  
  const [animState, setAnimState] = useState<"initial" | "enter" | "exit">("enter")

  useEffect(() => {
    if (!isHome) {
      setAnimState("initial")
      return
    }

    // Play the blue wipe on the home page
    setAnimState("enter")
    const enterTimeout = setTimeout(() => {
      setAnimState("exit")
      const exitTimeout = setTimeout(() => {
        setAnimState("initial")
      }, 1200)
      return () => clearTimeout(exitTimeout)
    }, 150)

    return () => clearTimeout(enterTimeout)
  }, [pathname, isHome])

  return (
    <>
      {isHome && (animState === "enter" || animState === "exit") && (
        <div className="nautical-transition-wrapper">
          <svg
            className="nautical-transition-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <motion.path
              fill="#04103C"
              variants={peelAwayAnimation}
              initial="enter"
              animate={animState}
              custom={0.3}
            />
            <motion.path
              fill="#0C1F6E"
              variants={peelAwayAnimation}
              initial="enter"
              animate={animState}
              custom={0.15}
            />
            <motion.path
              fill="#6396ee9e"
              variants={peelAwayAnimation}
              initial="enter"
              animate={animState}
              custom={0}
            />
          </svg>
        </div>
      )}
      
      {/* For subpages, just use a smooth fade. For home page, let the wipe reveal it. */}
      <motion.div 
        key={pathname}
        initial={{ opacity: isHome ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </>
  )
}

