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
  const [animState, setAnimState] = useState<"initial" | "enter" | "exit">("enter")
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (isFirstLoad) {
      const initialExit = setTimeout(() => {
        setIsFirstLoad(false)
        setAnimState("exit")
        setTimeout(() => setAnimState("initial"), 1200)
      }, 150)
      return () => clearTimeout(initialExit)
    }

    // On every pathname change
    setAnimState("enter")
    const enterTimeout = setTimeout(() => {
      setAnimState("exit")
      const exitTimeout = setTimeout(() => {
        setAnimState("initial")
      }, 1200)
      return () => clearTimeout(exitTimeout)
    }, 350)

    return () => clearTimeout(enterTimeout)
  }, [pathname])

  return (
    <>
      {(animState === "enter" || animState === "exit") && (
        <div className="nautical-transition-wrapper">
          <svg
            className="nautical-transition-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Layer 1 (Bottom): Light Blue - Shrinks away last (0.3s delay) */}
            <motion.path
              fill="#04103C"
              variants={peelAwayAnimation}
              initial="enter"
              animate={animState}
              custom={0.3}
            />
            {/* Layer 2 (Middle): Cerulean - Shrinks away second (0.15s delay) */}
            <motion.path
              fill="#0C1F6E"
              variants={peelAwayAnimation}
              initial="enter"
              animate={animState}
              custom={0.15}
            />
            {/* Layer 3 (Top): Dark Sapphire - Shrinks away immediately (0s delay) */}
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
      <div className="w-full h-full">{children}</div>
    </>
  )
}
