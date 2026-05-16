"use client"

import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Heading, clx } from "@medusajs/ui"

export default function MailingList() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          subscriber_email: email,
          source: 'Bulk Order Portal'
        },
        publicKey
      )
      
      setStatus('success')
      setMessage('Welcome aboard! You have successfully joined our mailing list.')
      setEmail('')
    } catch (error) {
      console.error('EmailJS Error:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again later.')
    }
  }

  return (
    <div className="bg-maritime-navy rounded-3xl border border-white/5 p-8 md:p-12 shadow-sm mt-12 overflow-hidden relative">
      <div className="max-w-xl space-y-6 relative z-10">
        <div>
          <h4 className="text-[10px] font-medium text-maritime-gold mb-3">Stay Updated</h4>
          <Heading className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-none">
            Join Our Voyage
          </Heading>
          <p className="text-white/60 text-sm font-medium mt-4 leading-relaxed">
            Join our mailing list to receive the latest updates, exclusive fleet offers, and maritime news directly in your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-maritime-gold/20 focus:border-maritime-gold transition-all"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={clx(
              "bg-white text-maritime-navy rounded-2xl px-8 py-4 text-xs font-medium hover:bg-maritime-gold hover:text-maritime-navy transition-all shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              status === 'loading' ? 'animate-pulse' : ''
            )}
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>

        {status !== 'idle' && (
          <p className={clx(
            "text-xs font-medium animate-in fade-in slide-in-from-top-2",
            status === 'success' ? "text-green-500" : "text-red-500"
          )}>
            {message}
          </p>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-12 w-24 h-24 truncate">
         <svg className="w-full h-full text-white opacity-5 rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
         </svg>
      </div>
    </div>
  )
}
