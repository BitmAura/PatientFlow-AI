'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Zap, Target } from 'lucide-react'
import { TrackedCtaLink } from '@/components/public/tracked-cta-link'
import { cn } from '@/lib/utils/cn'

/**
 * Landing Hero Section
 * 🚀 Persona: Founder/CEO & AI Engineer
 * 🎨 Aura Vision (Light Mode) Aesthetic
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 pt-24 pb-20 lg:pt-32 lg:pb-28 dark:from-emerald-950/10 dark:via-slate-950 dark:to-slate-900">
      {/* Dashboard-style light background accents */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-50/50 blur-[120px] dark:bg-cyan-900/10" />
      
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl dark:border-emerald-900/20 dark:bg-emerald-950/20">
            <Sparkles className="h-3 w-3" />
            #1 Patient Recovery Engine for Clinics
          </div>
          
          <h1 className="font-heading text-balance text-5xl font-black tracking-tight text-slate-900 lg:text-7xl dark:text-white leading-[1.1]">
            Your Clinic Loses <span className="text-emerald-600 text-glow-emerald">₹40,000 Every Month</span> to No-Shows.
          </h1>
          
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-relaxed text-slate-600 lg:text-xl dark:text-slate-400">
            PatientFlow AI sends automated WhatsApp reminders, recovers overdue patients, and fills cancelled slots — <span className="text-slate-900 dark:text-white font-bold">so your doctors never sit idle again.</span>
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-500 px-8 font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98] sm:w-auto"
            >
              Start 14-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <TrackedCtaLink
              href="#pricing"
              label="Explore Plans"
              location="homepage_hero"
              tone="secondary"
              className="h-14 w-full border-slate-200 bg-white px-8 font-bold text-slate-600 shadow-sm hover:bg-slate-50 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Explore Plans
            </TrackedCtaLink>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <StatChip label="Avg. Response Speed" value="< 5 Seconds" icon={<Zap className="h-4 w-4 text-emerald-500" />} />
            <StatChip label="Recall Recovery" value="+28% Month 1" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
            <StatChip label="High-Ticket Focus" value="Tier 1-3 AI" icon={<Target className="h-4 w-4 text-emerald-500" />} />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatChip({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-emerald-50 bg-white shadow-xl shadow-emerald-500/5 dark:border-emerald-900/20 dark:bg-slate-900/50">
      <div className="mb-2 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}
