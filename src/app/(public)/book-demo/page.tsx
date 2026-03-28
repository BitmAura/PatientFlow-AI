import type { Metadata } from 'next'
import { CalendarCheck2, Clock3, IndianRupee, Rocket } from 'lucide-react'
import { DemoBookingForm } from '@/components/public/demo-booking-form'

export const metadata: Metadata = {
  title: 'See No Show Killer in Action',
  description: 'Book a 15-minute demo and see how No Show Killer reduces clinic no-shows by 30%.',
}

export default function BookDemoPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_DEMO_CALENDAR_URL

  return (
    <div className="bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            15-minute strategy call
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            See No Show Killer in Action
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            15-minute demo showing how we reduce no-shows by 30%.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">What we will cover</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CalendarCheck2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Live WhatsApp automation demo
              </li>
              <li className="flex items-start gap-2">
                <IndianRupee className="mt-0.5 h-4 w-4 text-emerald-600" />
                ROI calculator for your clinic
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="mt-0.5 h-4 w-4 text-emerald-600" />
                Implementation timeline (48 hours)
              </li>
              <li className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Pricing and plans walkthrough
              </li>
            </ul>
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

          {!calendarUrl && (
            <p className="text-sm text-slate-500">
              Calendar embed will appear here when NEXT_PUBLIC_DEMO_CALENDAR_URL is configured.
            </p>
          )}
        </div>
        <DemoBookingForm />
      </div>
    </div>
  )
}
