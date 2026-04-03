import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarCheck2, Clock3, IndianRupee, Rocket, ArrowRight, Zap } from 'lucide-react'
import { DemoBookingForm } from '@/components/public/demo-booking-form'

export const metadata: Metadata = {
  title: 'Book a Free Demo — See PatientFlow AI in Action',
  description: 'Book a free 15-minute demo and see how PatientFlow AI reduces clinic no-shows by 75% with WhatsApp automation.',
}

export default function BookDemoPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_DEMO_CALENDAR_URL
  const isDemoBookingConfigured = Boolean(process.env.DEMO_BOOKING_CLINIC_ID)

  return (
    <div className="bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">

        {/* Left — info */}
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Free · 15 minutes · No sales pressure
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            See PatientFlow AI<br className="hidden sm:block" /> in Action
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            We will show you exactly how clinics like yours go from 30% no-shows to under 5% — live, on your data, in 15 minutes.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">What we cover</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><strong>Live demo</strong> — WhatsApp reminders, booking page, no-show recovery in action</span>
              </li>
              <li className="flex items-start gap-3">
                <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><strong>Your ROI</strong> — we calculate how much you recover based on your appointment volume</span>
              </li>
              <li className="flex items-start gap-3">
                <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><strong>48-hour setup</strong> — see the full implementation timeline for your clinic</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><strong>Pricing walkthrough</strong> — choose the right plan for your practice size</span>
              </li>
            </ul>
          </div>

          {/* Impatient path */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">Rather just try it yourself?</p>
            </div>
            <p className="text-xs text-emerald-700 mb-3">Start your free 14-day trial right now — no credit card, live in 10 minutes.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {calendarUrl && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <iframe
                src={calendarUrl}
                title="Book Demo Calendar"
                className="h-[520px] w-full rounded-xl"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Right — form */}
        <DemoBookingForm isConfigured={isDemoBookingConfigured} />
      </div>
    </div>
  )
}
