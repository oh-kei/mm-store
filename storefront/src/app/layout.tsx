import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Manrope } from "next/font/google"
import "styles/globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: "%s | Mariners Market's",
    default: "Mariners Market's",
  },
  description: "Discover premium maritime gear and apparel at Mariners Market's. Shop our high-quality collection of nautical-inspired clothing, gear, and custom team wear today.",
  keywords: ["Mariners Market", "Maritime Gear", "Nautical Apparel", "Marine Equipment", "Custom Team Wear", "Sailing Clothing", "Regatta Apparel"],
  authors: [{ name: "Mariners Market's Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Mariners Market's | Premium Maritime Gear & Apparel",
    description: "Shop high-quality maritime clothing and professional marine gear. Built for sailors, by sailors.",
    url: getBaseURL(),
    siteName: "Mariners Market's",
    images: [
      {
        url: "/mm-imgpreview-link.png",
        width: 1200,
        height: 630,
        alt: "Mariners Market's Store Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mariners Market's | Premium Maritime Gear & Apparel",
    description: "Shop high-quality maritime clothing and professional marine gear.",
    images: ["/mm-imgpreview-link.png"],
  },
}

import { SmoothScroll } from "@modules/layout/components/smooth-scroll"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={manrope.variable} data-scroll-behavior="smooth">
      <body className="font-sans">
        <SmoothScroll>
          <main className="relative">{props.children}</main>
        </SmoothScroll>
      </body>
    </html>
  )
}
