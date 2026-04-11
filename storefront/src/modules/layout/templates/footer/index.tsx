"use client"

import React from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Newsletter Section */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h4 className="text-xl font-bold" style={{ fontFamily: "'Manrope', sans-serif" }}>Join Our Voyage</h4>
          <p className="text-slate-400 text-sm">Join our mailing list for updates.</p>
          <form className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm flex-grow focus:outline-none focus:ring-1 focus:ring-white/40 transition-all text-white placeholder-slate-400"
              />
              <button 
                type="submit"
                className="bg-white text-[#0F172A] px-4 py-1.5 rounded-md text-sm font-bold hover:bg-slate-200 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Join
              </button>
            </div>
          </form>
        </div>

        {/* Links & Socials */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-4">
            {/* Instagram SVG */}
            <a href="https://www.instagram.com/marinersmarkets/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* Linkedin SVG */}
            <a href="https://www.linkedin.com/company/mariners-markets/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs text-slate-500 font-sans">
            <LocalizedClientLink href="/terms" className="hover:text-white transition-colors uppercase tracking-widest font-semibold">
              Terms and Policies
            </LocalizedClientLink>
            <p className="">
              © {new Date().getFullYear()} Mariners Market. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
