'use client'

import { 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Landmark, 
  Languages, 
  MessageCircleMore,
  CheckCircle2,
  WalletCards,
  Clock3,
  Stethoscope
} from 'lucide-react'

/**
 * Feature & Trust Grid
 * 📊 Persona: Performance Specialist
 * 🎨 Aura Vision (Light Mode) Aesthetic
 */
export function FeatureGrid() {
  const problems = [
    { icon: WalletCards, text: "30% of cleaning recalls never book." },
    { icon: Clock3, text: "20% no-show rate on RCT appointments hurts revenue." },
    { icon: Stethoscope, text: "Front desk gets buried in WhatsApp during peak hours." }
  ]

  const trustSignals = [
    { value: "Secure payments via Razorpay", description: "All plans billed in INR with GST invoicing.", icon: Landmark },
    { value: "GDPR-compliant handling", description: "No patient data is shared with third parties.", icon: ShieldCheck },
    { value: "Regional language support", description: "WhatsApp flows support Hindi/Kannada.", icon: Languages },
    { value: "Built in India", description: "Bangalore-led product team serving clinics.", icon: Building2 },
    { value: "Powered by Gupshup", description: "Meta partner infrastructure for Meta delivery.", icon: MessageCircleMore },
    { value: "High-Ticket Filter", description: "AI prioritization for Implants & Ortho leads.", icon: Sparkles }
  ]

  return (
    <section className="bg-slate-50 py-14 md:py-20 lg:py-28 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Why Dental Clinics Lose Patients */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Why Dental Clinics Lose High-Intent Patients
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
            Most dental teams are not short on inquiries. They are short on instant, consistent follow-up.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, idx) => (
            <MetricTile key={idx} icon={<p.icon className="h-5 w-5 text-rose-500" />} label="Patient Friction" value={p.text} color="rose" />
          ))}
        </div>

        {/* India-Market Trust Signals */}
        <div className="mt-24 md:mt-32">
          <div className="mx-auto max-w-3xl text-center mb-12">
             <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">India-Market Trust Signals</h2>
             <p className="mt-4 text-slate-500">Built for the unique operational requirements of Indian healthcare.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trustSignals.map((t, idx) => (
              <MetricTile 
                key={idx} 
                icon={<t.icon className="h-5 w-5 text-emerald-600" />} 
                label={t.value} 
                value={t.description} 
                color="emerald" 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricTile({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'emerald' | 'rose' }) {
  return (
    <div className={`p-6 rounded-2xl border bg-white shadow-xl shadow-emerald-500/5 transition hover:-translate-y-1 dark:bg-slate-900/50 ${
      color === 'emerald' ? 'border-emerald-50 dark:border-emerald-900/20' : 'border-rose-50 dark:border-rose-900/20'
    }`}>
      <div className={`mb-4 w-fit p-2 rounded-xl border ${
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/40' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/40'
      }`}>
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h3>
      <p className="text-base font-bold text-slate-900 leading-snug dark:text-white">{value}</p>
    </div>
  )
}
