'use client'

import React, { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { PageCard } from '@/components/dashboard/PageStructure'
import { cn } from '@/lib/utils/cn'

/**
 * WhatsApp Live Demo Page
 * 🎭 Persona: Frontend Developer & Founder/CEO
 * 💎 Glassmorphism + Emerald Medical Theme
 */
export default function DemoPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/whatsapp/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send demo')

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="relative mx-auto max-w-4xl px-4 py-12">
        {/* Decorative elements for premium feel */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Aura Vision Protocol
              </span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-6xl dark:text-white">
                Experience the <span className="text-emerald-600 dark:text-emerald-400">Future</span> of Clinic Automation.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Text your phone number below. Our AI will instantly send you a sample **Patient Recall** message, just like your patients would receive.
              </p>
            </div>

            <PageCard variant="default" className="border-emerald-100 bg-white/60 p-8 backdrop-blur-xl dark:border-emerald-900/20 dark:bg-slate-900/60">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="Ex: +91 99887 76655"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={cn(
                      "w-full rounded-xl border border-slate-200 bg-white/50 px-5 py-4 text-lg transition-all",
                      "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none",
                      "dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                    )}
                  />
                </div>
                
                <button
                  disabled={loading || success}
                  type="submit"
                  className={cn(
                    "w-full rounded-xl px-6 py-4 text-lg font-black tracking-wide text-white transition-all active:scale-[0.98]",
                    success 
                      ? "bg-emerald-500 shadow-emerald-500/20" 
                      : "bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-emerald-700/40",
                    loading && "animate-pulse cursor-not-allowed opacity-70"
                  )}
                >
                  {loading ? 'Sending AI Demo...' : success ? '✨ Message Sent!' : 'Get Live Demo Now'}
                </button>
              </form>

              {error && <p className="mt-4 text-center text-sm font-bold text-red-500">{error}</p>}
              {success && (
                <p className="mt-4 text-center text-sm font-medium text-emerald-600">
                  Check your phone! You just recovered ₹2,500 in potential revenue.
                </p>
              )}
            </PageCard>
          </div>

          {/* Phone Simulation Section */}
          <div className="relative mx-auto h-[700px] w-[340px] perspective-1000 lg:mx-0">
             <div className="absolute inset-0 rotate-y-[-10deg] rounded-[3rem] border-8 border-slate-900 bg-slate-900 shadow-2xl transition-transform hover:rotate-y-0">
                {/* Screen Content Wrapper */}
                <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-[#075e54]">
                   {/* WhatsApp Header */}
                   <div className="flex h-16 items-center bg-[#075e54]/90 px-6 pt-4 text-white">
                      <div className="h-10 w-10 rounded-full bg-slate-200/20" />
                      <div className="ml-3">
                         <p className="text-xs font-bold leading-none">Kumars Dentistry (Aura AI)</p>
                         <p className="text-[10px] opacity-70">Online</p>
                      </div>
                   </div>

                   {/* Chat Bubble Area */}
                   <div className="h-full bg-[#e5ddd5] p-4 text-[11px] leading-relaxed dark:bg-slate-800">
                      <div className="mx-auto my-2 w-fit rounded-lg bg-emerald-100 px-3 py-1 text-center text-[9px] font-bold text-emerald-800/60 uppercase tracking-tighter">
                         Today
                      </div>
                      
                      <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="max-w-[85%] rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
                            <p className="font-bold text-emerald-600">PatientFlow AI Demo</p>
                            <p className="mt-1 text-slate-800 dark:text-slate-100">
                               Hi Future Clinic Partner! 👋 This is how your patients will receive their recall reminders. Polished, professional, and automated.
                            </p>
                            <p className="mt-1 text-[9px] text-right text-slate-400">10:41 AM</p>
                         </div>
                      </div>

                      {success && (
                         <div className="mt-4 animate-in zoom-in-50 duration-500">
                            <div className="max-w-[85%] rounded-lg bg-white p-3 shadow-sm border-l-4 border-emerald-500 dark:bg-slate-700">
                               <p className="font-bold text-emerald-600">Appointment Reminder</p>
                               <p className="mt-1 text-slate-800 dark:text-slate-100">
                                  Hi Future Clinic Partner! It's been 6 months since your last cleaning. Would you like to schedule your microscopic dental checkup?
                               </p>
                               <div className="mt-2 rounded bg-emerald-50 p-1.5 text-center font-bold text-emerald-600 text-[10px]">
                                  Reply 'BOOK' to schedule
                               </div>
                               <p className="mt-1 text-[9px] text-right text-slate-400">Just Now</p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
