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
    <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm mt-12 overflow-hidden relative">
      <div className="max-w-xl space-y-6 relative z-10">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-maritime-gold mb-3">Stay Updated</h4>
          <Heading className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">
            Join Our Voyage
          </Heading>
          <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed">
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
            className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-maritime-gold/20 focus:border-maritime-gold transition-all"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={clx(
              "bg-slate-900 text-white rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              status === 'loading' ? 'animate-pulse' : ''
            )}
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>

        {status !== 'idle' && (
          <p className={clx(
            "text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2",
            status === 'success' ? "text-green-500" : "text-red-500"
          )}>
            {message}
          </p>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-12 w-24 h-24 truncate">
         <svg className="w-full h-full text-slate-50 opacity-20 rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
         </svg>
      </div>
    </div>
  )
}
