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
}

import { SmoothScroll } from "@modules/layout/components/smooth-scroll"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={manrope.variable}>
      <body className="font-sans">
        <SmoothScroll>
          <main className="relative">{props.children}</main>
        </SmoothScroll>
      </body>
    </html>
  )
}
