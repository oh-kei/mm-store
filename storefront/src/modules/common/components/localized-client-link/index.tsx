"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()
  const router = useRouter()

  const handleMouseEnter = () => {
    if (router && typeof href === "string") {
      router.prefetch(`/${countryCode}${href}`)
    }
  }

  return (
    <Link 
      href={`/${countryCode}${href}`} 
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
