'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, TrendingUp, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Morning Intelligence Card
 * 🚀 Persona: Founder/CEO & AI Engineer
 * 💎 Emerald Glassmorphism Aesthetic
 */
export function MorningIntelligenceCard({ 
  userName = 'Partner',
  recoveredRevenue = 0,
  newLeads = 0,
  growth = 12.5
}: { 
  userName?: string
  recoveredRevenue?: number
  newLeads?: number
  growth?: number
}) {
  return (
    <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:border-emerald-900/20 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10 shadow-xl shadow-emerald-500/5">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* AI Greeting & Summary */}
          <div className="space-y-2 flex-1">
             <div className="flex items-center gap-2 text-emerald-600 font-black tracking-widest text-[10px] uppercase">
                <Sparkles className="h-3 w-3" />
                Aura Vision Intelligence Active
             </div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Good Morning, {userName}. <br />
                You recovered <span className="text-emerald-500">₹{recoveredRevenue.toLocaleString()}</span> while you were away.
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
                Your AI assistant processed <span className="font-bold text-slate-700 dark:text-slate-200">{newLeads} new high-ticket leads</span> since yesterday. Patient flow efficiency is up <span className="text-emerald-500 font-bold">+{growth}%</span> this week.
             </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
             <MetricTile 
                icon={<TrendingUp className="h-4 w-4" />} 
                label="Daily Growth" 
                value={`+${growth}%`} 
                color="emerald"
             />
             <MetricTile 
                icon={<Target className="h-4 w-4" />} 
                label="High-Ticket" 
                value={newLeads.toString()} 
                color="blue"
             />
          </div>

        </div>
        
        {/* Bottom Bar Hints */}
        <div className="mt-6 flex items-center gap-4 border-t border-emerald-100 pt-4 dark:border-emerald-900/30">
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Zap className="h-3 w-3 text-emerald-500" />
              Tip: Tier 1 Implants have the highest conversion rate today.
           </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricTile({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'emerald' | 'blue' }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4 rounded-2xl border bg-white shadow-sm dark:bg-slate-800/50 min-w-32",
      color === 'emerald' ? "border-emerald-100 dark:border-emerald-900/20" : "border-blue-100 dark:border-blue-900/20"
    )}>
       <div className={cn(
         "mb-2 p-1.5 rounded-lg",
         color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
       )}>
          {icon}
       </div>
       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
       <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}
