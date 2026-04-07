'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Bell, CheckCircle, BarChart2, Users, Zap, Sparkles, ArrowRight, TrendingUp, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 🚀 Aura Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 py-20 lg:py-32 dark:from-emerald-950/10 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl">
            <Zap className="h-3 w-3" />
            Operational Efficiency Protocol
          </div>
          <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white">
            Three Steps to <br /><span className="text-emerald-500">Zero No-Shows</span>
          </h1>
          <p className="text-lg text-slate-500 md:text-xl dark:text-slate-400">
            Getting started with PatientFlow AI is effortless. We integrate directly with your existing clinical workflow to recover leaked revenue on autopilot.
          </p>
        </div>
      </section>

      {/* 🧬 Steps (Aura Logic) */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-32">
            <Step
              number="01"
              title="Connect Your Clinic in 10 Minutes"
              description="Set up your WhatsApp number, add your doctors and services, and you're live. No IT team needed — our guided onboarding walks you through every step."
              align="left"
              points={[
                'Link your existing WhatsApp Business number',
                'Add doctors, services, and availability',
                'Set reminder templates in your clinic tone',
              ]}
              visual={<OnboardingMockup />}
            />
            <Step
              number="02"
              title="Automation Runs — You Do Nothing"
              description="PatientFlow AI sends WhatsApp reminders 24h and 3h before each appointment. If a patient no-shows, a recovery message goes out automatically within the hour."
              align="right"
              points={[
                'Automated 24h + 3h WhatsApp reminders',
                'No-show recovery sent within 60 minutes',
                'Waitlist AI auto-fills slots with high-ticket leads',
              ]}
              visual={<WhatsAppMockup />}
            />
            <Step
              number="03"
              title="Watch Revenue Recover in Real Time"
              description="Your dashboard shows exactly how many patients confirmed, who no-showed, and how much revenue was recovered. Every week you see the impact."
              align="left"
              points={[
                'Live no-show rate and show-up tracking',
                'Monthly revenue recovery dashboard',
                'Staff performance leaderboards for doctors',
              ]}
              visual={<DashboardMockup />}
            />
          </div>
        </div>
      </section>

      {/* 🛠️ Operations Stack */}
      <section className="bg-white py-20 lg:py-32 dark:bg-slate-900/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-14 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">Built Around Real Clinic Workflows</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              'WhatsApp Messaging',
              'Reminder Settings',
              'No-Show Recovery',
              'Waitlist Management',
              'Booking Pages',
              'Patient Follow-ups',
              'Impact Dashboard',
              'Clinic Team Access',
            ].map((tool) => (
              <div key={tool} className="flex items-center justify-center rounded-2xl border border-emerald-50 bg-white p-8 text-sm font-black uppercase tracking-widest text-slate-400 shadow-xl shadow-emerald-500/5 transition hover:-translate-y-1 dark:bg-slate-900 dark:border-emerald-900/20">
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ (Emerald Glassmorphism) */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 gap-6">
            <FAQItem 
              question="Is PatientFlow AI secure for clinic data?" 
              answer="Yes. We use encryption in transit and at rest, role-based access controls, and tenant-isolated data policies. Workflows are designed to support Indian healthcare data handling expectations, including DISHA-aligned practices."
            />
            <FAQItem 
              question="Can I use my own WhatsApp number?" 
              answer="Absolutely. You can link your existing WhatsApp Business number or we can provide a dedicated number for your practice via our Meta partner infrastructure."
            />
            <FAQItem 
              question="What happens if a patient replies?" 
              answer="Replies are captured in PatientFlow AI and can trigger your follow-up workflows. Your staff can continue handling responses from the centralized communication dashboard."
            />
            <FAQItem 
              question="Is there a setup fee?" 
              answer="No, there are no setup fees. You can start with our 14-day free trial and choose a plan that fits your practice size. We provide priority setup for Pro and Growth plans."
            />
          </div>
        </div>
      </section>
      
      {/* 🏁 Final CTA */}
      <section className="py-24 text-center">
         <div className="container mx-auto px-4">
           <div className="relative mx-auto max-w-4xl rounded-[40px] border border-emerald-100 bg-white px-6 py-14 shadow-2xl shadow-emerald-500/5 dark:border-emerald-900/20 dark:bg-slate-900 sm:px-14">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-lg">
                <Sparkles className="h-3 w-3" />
                Performance Activation
            </div>
            <h2 className="mb-8 text-3xl font-black text-slate-900 sm:text-5xl dark:text-white">Ready for 100% Patient Flow?</h2>
            <Link href="/signup">
              <Button size="lg" className="h-16 rounded-2xl bg-emerald-500 px-10 text-lg font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98]">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  align,
  points,
  visual,
}: {
  number: string
  title: string
  description: string
  align: 'left' | 'right'
  points: string[]
  visual: React.ReactNode
}) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center gap-16 md:gap-24",
      align === 'right' ? 'md:flex-row-reverse' : ''
    )}>
      <div className="flex-1 space-y-8">
        <div className="text-8xl font-black text-slate-100 dark:text-slate-900/50 leading-none">{number}</div>
        <h3 className="text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">{title}</h3>
        <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        <ul className="space-y-4">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 font-bold text-slate-600 dark:text-slate-300">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/20">
                <Check className="h-3 w-3" />
              </div>
              <span className="text-base">{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full relative">
        <div className="absolute -inset-10 bg-emerald-100/30 blur-[100px] -z-10 rounded-full" />
        {visual}
      </div>
    </div>
  )
}

// ── Visual mockups (Emerald Glassmorphism) ──────────────────────────────────

function OnboardingMockup() {
  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white shadow-2xl overflow-hidden dark:border-emerald-900/20 dark:bg-slate-900">
      <div className="flex items-center gap-1.5 bg-slate-50 px-6 py-4 border-b border-emerald-50 dark:bg-slate-800/50 dark:border-emerald-900/10">
        <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 mb-2">
           <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5" />
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Aura Connection</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Protocol Active</p>
           </div>
        </div>
        <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5 dark:bg-emerald-950/20 dark:border-emerald-900/30">
          <p className="text-xs font-black text-emerald-800 mb-1 dark:text-emerald-400 uppercase tracking-widest leading-none">WhatsApp Connected</p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">+91 98XXX XXX10 · Verified API</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse" />
          <div className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function WhatsAppMockup() {
  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white shadow-2xl overflow-hidden dark:border-emerald-900/20 dark:bg-slate-900">
      <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">SD</div>
            <div>
              <p className="text-sm font-black leading-none">Aura AI: Assistant</p>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1">Verified Clinical Flow</p>
            </div>
        </div>
      </div>
      <div className="bg-[#e5ddd5] dark:bg-slate-800/50 p-6 space-y-4 min-h-[240px]">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-xs bg-white text-slate-800 shadow-sm self-start border border-slate-100">
           Hi Rahul, Dr. Sharma has an open slot tomorrow at 11 AM. Reply YES to confirm.
        </div>
        <div className="max-w-[40%] rounded-2xl px-4 py-3 text-xs bg-[#dcf8c6] text-slate-800 shadow-sm ml-auto border border-emerald-100">
           YES
        </div>
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-xs bg-white text-slate-800 shadow-sm self-start border border-slate-100">
           Confirmed! Your Dental consultation is secured for tomorrow.
        </div>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="rounded-[32px] border border-emerald-100 bg-white shadow-2xl overflow-hidden dark:border-emerald-900/20 dark:bg-slate-900">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-slate-50 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-8 bg-emerald-500 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Recovered', value: '₹12K+', icon: BarChart2, color: 'text-emerald-500 bg-emerald-50/50' },
            { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-cyan-500 bg-cyan-50/50' },
            { label: 'TIER-1', value: '3', icon: Target, color: 'text-blue-500 bg-blue-50/50' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-50 p-4 dark:bg-slate-800/50 dark:border-slate-700 text-center">
              <div className={`h-8 w-8 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.value}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="h-6 w-full bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="group rounded-[24px] border border-emerald-50 bg-white p-8 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-slate-900 dark:border-emerald-900/20">
      <h3 className="mb-3 text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{question}</h3>
      <p className="text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
    </div>
  )
}
