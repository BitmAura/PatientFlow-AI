'use client'

import { Sparkles } from 'lucide-react'

/**
 * Public Loading State
 * 🧬 Persona: Performance Specialist
 * 🎨 Aura Vision Aesthetic
 */
export default function PublicLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-emerald-500/20" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-xl dark:border-emerald-900/20 dark:bg-slate-900">
          <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
        Aura Vision Activating...
      </p>
    </div>
  )
}
