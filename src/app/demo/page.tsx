'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/page-container'
import { PageCard } from '@/components/dashboard/PageStructure'
import { cn } from '@/lib/utils/cn'
import { UnifiedHeader } from '@/components/shared/unified-header'
import { ArrowLeft, Sparkles } from 'lucide-react'

/**
 * WhatsApp Live Demo Page
 * 🎭 Persona: Frontend Developer & Founder/CEO
 * 💎 Glassmorphism + Emerald Medical Theme
 */
export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Local simulated demo: triggers the in-page phone preview without requiring
  // the user to enter their WhatsApp number or rely on WhatsApp Business.
  const startDemo = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      // Simulate activation delay
      await new Promise((res) => setTimeout(res, 800))
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to activate demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <UnifiedHeader variant="marketing" />
      
      <PageContainer className="flex min-h-screen items-center justify-center pt-24 lg:pt-32">
        <div className="relative mx-auto max-w-5xl px-4 py-12">
          {/* Back Button for accessibility */}
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Decorative elements for premium feel */}
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl opacity-50" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl opacity-50" />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center relative">
            {/* Content Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Aura Vision Protocol
                </span>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-6xl dark:text-white">
                  Experience the <span className="text-emerald-600 dark:text-emerald-400">Future</span> of Clinic Automation.
                </h1>
                <p className="text-lg font-bold text-slate-500 dark:text-slate-400">
                  Text your phone number below. Our AI will instantly send you a sample **Patient Recall** message, just like your patients would receive.
                </p>
              </div>

                <PageCard variant="default" className="border-emerald-100 bg-white/60 p-8 backdrop-blur-xl dark:border-emerald-900/20 dark:bg-slate-900/60 shadow-2xl shadow-emerald-500/5">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Play an interactive in-page demo to see how PatientFlow AI crafts and sends patient reminders, recovery nudges and booking prompts —
                      no WhatsApp number or third-party setup required. This is a simulated preview for evaluation purposes only.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={startDemo}
                        disabled={loading || success}
                        className={cn(
                          "flex-1 rounded-xl px-6 py-4 text-lg font-black tracking-wide text-white transition-all active:scale-[0.98]",
                          success
                            ? "bg-emerald-500 shadow-emerald-500/20"
                            : "bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700",
                          loading && "animate-pulse cursor-not-allowed opacity-70"
                        )}
                      >
                        {loading ? 'Activating Demo...' : success ? '✨ Demo Ready' : 'Play Simulated Demo'}
                      </button>

                      <Link href="/signup" className="flex-0 hidden items-center rounded-xl px-6 py-4 text-lg font-black tracking-wide text-emerald-700 border border-emerald-200 hover:bg-emerald-50 md:inline-flex">
                        Start Free Trial
                      </Link>
                    </div>

                    {error && <p className="mt-4 text-center text-sm font-black text-red-500 bg-red-50 py-2 rounded-lg">{error}</p>}
                    {success && (
                      <p className="mt-4 text-center text-sm font-black text-emerald-600 uppercase tracking-tight">
                        Demo activated — watch the in-page preview on the right.
                      </p>
                    )}
                  </div>
                </PageCard>
            </div>

            {/* Phone Simulation Section */}
            <div className="relative mx-auto h-[700px] w-[340px] perspective-1000 lg:mx-0">
               <div className="absolute inset-0 rotate-y-[-10deg] rounded-[3rem] border-8 border-slate-900 bg-slate-900 shadow-3xl transition-transform hover:rotate-y-0">
                  {/* Screen Content Wrapper */}
                  <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-[#075e54]">
                     {/* WhatsApp Header */}
                     <div className="flex h-16 items-center bg-[#075e54]/90 px-6 pt-4 text-white">
                        <div className="h-10 w-10 rounded-full bg-slate-200/20" />
                        <div className="ml-3">
                           <p className="text-xs font-black leading-none uppercase tracking-tight">Kumars Dentistry (Aura AI)</p>
                           <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Online Now</p>
                        </div>
                     </div>

                     {/* Chat Bubble Area */}
                     <div className="h-[calc(100%-4rem)] bg-[#e5ddd5] p-4 text-[11px] leading-relaxed dark:bg-slate-800">
                        <div className="mx-auto my-2 w-fit rounded-lg bg-emerald-100 px-3 py-1 text-center text-[9px] font-black text-emerald-800/60 uppercase tracking-tighter">
                           Today
                        </div>
                        
                        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <div className="max-w-[85%] rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
                              <p className="font-black text-emerald-600 uppercase text-[9px] mb-1">Aura Assistant</p>
                              <p className="text-slate-800 dark:text-slate-100 font-medium">
                                 Hi Future Clinic Partner! 👋 This is how your patients will receive their recall reminders. Polished, professional, and automated.
                              </p>
                              <p className="mt-1 text-[9px] text-right text-slate-400">10:41 AM</p>
                           </div>
                        </div>

                        {success && (
                           <div className="mt-4 animate-in zoom-in-50 duration-500">
                              <div className="max-w-[85%] rounded-lg bg-white p-3 shadow-sm border-l-4 border-emerald-500 dark:bg-slate-700">
                                 <p className="font-black text-emerald-600 uppercase text-[9px] mb-1">Revenue Recovery Activity</p>
                                 <p className="text-slate-800 dark:text-slate-100 font-medium tracking-tight">
                                    Hi Future Clinic Partner! It's been 6 months since your last cleaning. Would you like to schedule your microscopic dental checkup?
                                 </p>
                                 <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center font-black text-emerald-600 text-[10px] border border-emerald-100 uppercase tracking-widest">
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
    </div>
  )
}
