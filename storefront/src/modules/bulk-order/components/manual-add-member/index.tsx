"use client"

import React, { useState } from "react"
import { Plus, UserPlus } from "lucide-react"

interface ManualAddMemberProps {
  onAdd: (member: { name: string; size: string }) => void
}

export function ManualAddMember({ onAdd }: ManualAddMemberProps) {
  const [name, setName] = useState("")
  const [size, setSize] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && size) {
      onAdd({ name, size })
      setName("")
      setSize("")
    }
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col md:flex-row items-end gap-6 shadow-sm"
    >
      <div className="flex-grow space-y-3 w-full">
        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Member Name</label>
        <div className="relative">
           <input 
             type="text" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             placeholder="e.g. John Doe"
             className="w-full bg-white border border-slate-200 rounded-xl h-12 px-5 text-sm font-bold focus:border-maritime-gold outline-none transition-all text-slate-900 placeholder:text-slate-300 shadow-sm"
             required
           />
        </div>
      </div>

      <div className="w-full md:w-40 space-y-3">
        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Size</label>
        <select 
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl h-12 px-5 text-sm font-bold focus:border-maritime-gold outline-none transition-all appearance-none cursor-pointer text-slate-900 shadow-sm"
          required
        >
          <option value="" disabled>Select</option>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <button 
        type="submit"
        className="h-12 px-10 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-maritime-gold hover:text-maritime-navy transition-all flex items-center justify-center gap-3 whitespace-nowrap w-full md:w-auto shadow-md"
      >
        <Plus size={16} />
        Add Member
      </button>
    </form>
  )
}
