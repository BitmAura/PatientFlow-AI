'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const TESTIMONIALS = [
  {
    quote: "We went from 30% no-shows to under 7% in the first month. The WhatsApp reminders work better than any call our staff was making.",
    name: "Dr. Anjali Sharma",
    role: "Founder, Smile First Dental, Pune",
    initials: "AS",
    color: "bg-emerald-500",
  },
  {
    quote: "Setup took 15 minutes. My receptionist now spends time with patients instead of chasing confirmations all day.",
    name: "Dr. Rohan Mehta",
    role: "Orthopaedic Surgeon, Mumbai",
    initials: "RM",
    color: "bg-blue-500",
  },
  {
    quote: "The recall system brought back patients I thought were gone forever. Recovered ₹2 lakhs in one quarter from re-bookings alone.",
    name: "Dr. Priya Iyer",
    role: "Dermatologist, Apollo Clinic, Chennai",
    initials: "PI",
    color: "bg-violet-500",
  },
]

const STATS = [
  { value: "75%", label: "Avg. reduction in no-shows" },
  { value: "2 hrs", label: "Staff time saved daily" },
  { value: "₹80K+", label: "Avg. monthly revenue recovered" },
]

export function AuthRightPanel() {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const t = TESTIMONIALS[active]

  return (
    <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-950 flex-col justify-start gap-8 px-14 py-12">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#0f4c3a44_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_right,_#1e3a8a33_0%,_transparent_60%)]" />

      {/* Top content */}
      <div className="relative z-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Trusted by 500+ clinics across India
        </div>

        <h2 className="mt-6 text-4xl font-bold leading-tight text-white">
          Stop losing patients.<br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Start recovering revenue.
          </span>
        </h2>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Clinics using PatientFlow AI cut no-shows by 75% in the first 30 days —
          without hiring more staff or changing how they work.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/4 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature checklist — fills the gap */}
      <div className="relative z-10 rounded-2xl border border-white/8 bg-white/4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">What you get on day one</p>
        <ul className="space-y-2.5">
          {[
            'WhatsApp reminders sent automatically — 24h & 3h before',
            'Online booking page live in under 10 minutes',
            'No-show recovery messages sent within 1 hour',
            'Patient recall engine for bringing back lost patients',
            'Full dashboard: appointments, analytics, reports',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial */}
      <div className="relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {/* Quote */}
          <p className="text-base leading-relaxed text-slate-200">
            &ldquo;{t.quote}&rdquo;
          </p>

          {/* Author */}
          <div className="mt-5 flex items-center gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white', t.color)}>
              {t.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-slate-400">{t.role}</p>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-4 flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20'
                )}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Security footnote */}
        <p className="mt-6 text-center text-xs text-slate-500">
          🔒 Your patient data is encrypted at rest and in transit. We never sell or share data with third parties.
        </p>
      </div>
    </div>
  )
}
