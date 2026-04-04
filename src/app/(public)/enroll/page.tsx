'use client'

import React, { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { PageCard } from '@/components/dashboard/PageStructure'
import { cn } from '@/lib/utils/cn'
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

/**
 * 1-Click Enrollment Page
 * 🚀 Persona: Founder/CEO & Frontend Developer
 * 💎 Emerald Glassmorphism Aesthetic
 */
export default function EnrollPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    clinicName: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) throw new Error('Enrollment failed')
      
      setSuccess(true)
      // Redirect to onboarding or dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/onboarding'
      }, 2000)
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Success State */}
        {success ? (
          <PageCard variant="default" className="text-center p-12 border-emerald-500/30 bg-white/10 backdrop-blur-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-white">Welcome Aboard!</h2>
            <p className="mt-4 text-emerald-100/70">
              Your 14-day free trial has started. Redirecting you to your new clinic dashboard...
            </p>
            <div className="mt-8 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 animate-progress-fast" />
            </div>
          </PageCard>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-sm backdrop-blur-xl">
                <Sparkles className="h-3 w-3" />
                Limited: 15 Spots Remaining
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
                Ready to Recover <span className="text-emerald-400">₹40k+</span>?
              </h1>
              <p className="text-slate-400">
                Setup your clinic in under 60 seconds. No credit card required.
              </p>
            </div>

            <PageCard variant="default" className="border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Founder Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Dr. Rajesh Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinic Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Kumar's Dental Care"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 99887 76655"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-xl bg-emerald-500 font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]",
                    loading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {loading ? 'Activating Aura Vision...' : 'Start My Free Trial'}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-6 border-t border-white/5 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  Instant Activation
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  DISHA Compliant
                </div>
              </div>
            </PageCard>

            <p className="text-center text-xs text-slate-500">
              By proceeding, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
