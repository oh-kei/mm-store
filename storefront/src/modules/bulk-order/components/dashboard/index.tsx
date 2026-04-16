"use client"

import React from "react"
import { Heading } from "@medusajs/ui"
import { Users, ShoppingBag, TrendingUp, Clock } from "lucide-react"

interface DashboardProps {
  rosterCount: number
  orderCount: number
}

export function TeamDashboard({ rosterCount, orderCount }: DashboardProps) {
  return (
    <div className="space-y-16 bg-white min-h-[60vh] rounded-[32px] p-8 md:p-16 text-slate-900 shadow-sm border border-slate-100">
      <div className="flex flex-col gap-4 mt-8">
        <Heading className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-none">Team Overview</Heading>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Fleet Management Hub</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard 
          icon={<Users size={24} />} 
          title="Active Crew" 
          value={rosterCount.toString()} 
          subtitle="Linked to Roster" 
          color="bg-blue-50 border-blue-100 text-blue-600"
        />
        <SummaryCard 
          icon={<ShoppingBag size={24} />} 
          title="Manifests" 
          value={orderCount.toString()} 
          subtitle="Processed Orders" 
          color="bg-amber-50 border-amber-100 text-amber-600"
        />
        <SummaryCard 
          icon={<Clock size={24} />} 
          title="Lead Time" 
          value="7-10" 
          subtitle="Estimated Days" 
          color="bg-emerald-50 border-emerald-100 text-emerald-600"
        />
      </div>
    </div>
  )
}

function SummaryCard({ icon, title, value, subtitle, color }: { icon: any, title: string, value: string, subtitle: string, color: string }) {
  return (
    <div className={`p-8 rounded-[32px] border ${color} space-y-6 shadow-sm transition-transform hover:scale-[1.02] duration-300`}>
      <div className="flex items-center justify-between">
        <div className="text-current opacity-80">{icon}</div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2">{title}</h4>
        <p className="text-4xl font-black tracking-tight">{value}</p>
        <p className="text-[10px] uppercase font-black opacity-30 mt-2">{subtitle}</p>
      </div>
    </div>
  )
}

function ActivityItem({ title, desc, time }: { title: string, desc: string, time: string }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
          <Clock size={16} className="text-white/20" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{title}</p>
          <p className="text-xs text-white/40">{desc}</p>
        </div>
      </div>
      <p className="text-[10px] uppercase font-black tracking-widest text-white/20">{time}</p>
    </div>
  )
}
