"use client"

import React, { useState, useRef } from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { clx } from "@medusajs/ui"
import emailjs from '@emailjs/browser'
import { Loader2, CheckCircle2 } from "lucide-react"

interface FooterProps {
  variant?: "dark" | "light"
}

export default function Footer({ variant = "dark" }: FooterProps) {
  const isLight = variant === "light" || (typeof window !== "undefined" && window.location.pathname.includes("/bulk-order") && variant === "light")
  const pathname = usePathname()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState("")

  // Hide the global dark footer on bulk-order pages to avoid double footers
  if (pathname.includes("/bulk-order") && !isLight) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          user_email: email,
          to_name: "Mariners Market Team",
          message: `New subscription from: ${email}`
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      )
      setIsSuccess(true)
      setEmail("")
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error("EmailJS Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className={clx(
      "py-16 px-6 transition-colors duration-500",
      isLight ? "bg-white text-slate-900 border-t border-slate-100" : "bg-[#0F172A] text-white"
    )}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        {/* Newsletter Section */}
        <div className="flex flex-col gap-6 w-full max-w-lg">
          <div className="space-y-2">
            <h4 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Join Our Voyage</h4>
            <p className={clx(
              "text-sm font-medium leading-relaxed max-w-sm",
              isLight ? "text-slate-500" : "text-slate-400"
            )}>
              Join our mailing list to receive the latest updates, exclusive fleet offers, and maritime news directly in your inbox.
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                className={clx(
                  "rounded-xl px-4 py-3 text-sm flex-grow outline-none transition-all font-bold",
                  isLight 
                    ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-maritime-gold focus:ring-4 focus:ring-maritime-gold/5" 
                    : "bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-white/40 focus:ring-4 focus:ring-white/5"
                )}
              />
              <button 
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={clx(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center min-w-[120px]",
                  isSuccess 
                    ? "bg-green-500 text-white" 
                    : "bg-amber-400 text-maritime-navy hover:bg-amber-500 active:scale-95 disabled:opacity-50"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isSuccess ? (
                  <CheckCircle2 size={16} />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
            {isSuccess && (
              <p className="text-[10px] font-black uppercase tracking-widest text-green-500 animate-in fade-in slide-in-from-top-1">
                Email added successfully
              </p>
            )}
          </form>
        </div>

        {/* Links & Socials */}
        <div className="flex flex-col items-start md:items-end gap-8 w-full md:w-auto">
          <div className="flex gap-4">
            {/* Instagram SVG */}
            <a href="https://www.instagram.com/marinersmarkets/" target="_blank" rel="noopener noreferrer" className={clx(
              "p-3 rounded-full border transition-all hover:scale-110",
              isLight ? "border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* Linkedin SVG */}
            <a href="https://www.linkedin.com/company/mariners-markets/" target="_blank" rel="noopener noreferrer" className={clx(
              "p-3 rounded-full border transition-all hover:scale-110",
              isLight ? "border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-[10px] uppercase tracking-[0.2em] font-black">
            <div className="flex gap-6">
              <LocalizedClientLink href="/privacy-policy" className={clx(
                "transition-colors",
                isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white"
              )}>
                Privacy Policy
              </LocalizedClientLink>
              <span className={isLight ? "text-slate-300" : "text-slate-800"}>|</span>
              <p className={isLight ? "text-slate-400" : "text-slate-500"}>
                © {new Date().getFullYear()} Mariners Market
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

