'use client'

import { 
  MessageSquare, 
  Clock, 
  Shield, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  Calendar, 
  Users, 
  BarChart3,
  Target,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: "Waitlist AI Recovery",
      description: "Our proprietary AI automatically scans for cancellations and fills empty slots with matched high-ticket leads (Tier-1) within minutes.",
      isNew: true
    },
    {
      icon: Search,
      title: "Price List AI",
      description: "Allow patients to query procedure pricing via WhatsApp instantly. Our AI matches their query to your clinical treatment list.",
      isNew: true
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Automation",
      description: "Send automated reminders, confirmations, and follow-ups directly to your patients' favorite app. Reduce manual calls by 85%."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Advanced booking flows with real-time doctor availability and procedure-specific slot selection logic."
    },
    {
      icon: Target,
      title: "Tier-1 Lead Scoring",
      description: "Identify and prioritize high-value patients (Implants, Ortho, Aesthetics) to maximize clinic ROI automatically."
    },
    {
      icon: BarChart3,
      title: "Founder Intelligence",
      description: "Get weekly 'Morning Intelligence' reports on recovered revenue, staff performance, and patient flow efficiency."
    },
    {
      icon: Smartphone,
      title: "Aura Mobile Dashboard",
      description: "A clinical-minimalist dashboard optimized for mobile. Manage your entire practice flow from the palm of your hand."
    },
    {
      icon: CheckCircle2,
      title: "Review Booster",
      description: "Automatically request feedback and Google Reviews from happy patients after successful clinical outcomes."
    },
    {
      icon: Shield,
      title: "Data Sovereignty",
      description: "Enterprise-grade encryption and DISHA-compliant data handling ensuring your clinical records remain secure."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 🚀 Aura Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 py-20 lg:py-32 dark:from-emerald-950/10 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl">
            <Sparkles className="h-3 w-3" />
            Clinical Excellence Toolkit
          </div>
          <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white leading-tight">
            The <span className="text-emerald-500 text-glow-emerald">Aura Vision</span> <br />Feature Suite
          </h1>
          <p className="text-lg text-slate-500 md:text-xl dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to automate your patient flow, recover leaked revenue, and provide a premium digital experience for your patients.
          </p>
        </div>
      </section>

      {/* 🧬 Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative rounded-[32px] border border-emerald-50 bg-white p-10 shadow-xl shadow-emerald-500/5 transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900 dark:border-emerald-900/20">
                {feature.isNew && (
                  <div className="absolute top-6 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                    Aura AI
                  </div>
                )}
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 transition-transform group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-xl font-black text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏁 CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-4xl rounded-[48px] border border-emerald-100 bg-white px-10 py-20 text-center shadow-3xl shadow-emerald-500/10 dark:border-emerald-900/20 dark:bg-slate-900">
            <h2 className="mb-8 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Ready to <span className="text-emerald-500">Automate</span>?
            </h2>
            <p className="mb-12 text-lg font-bold text-slate-500 dark:text-slate-400">
              Join the elite clinics using PatientFlow AI to achieve 100% operational efficiency.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-16 rounded-[20px] bg-emerald-500 px-12 text-lg font-black text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
