import type { Metadata } from 'next'
import Link from 'next/link'
import { TwentyOneButton } from '@/components/ui/twentyone-button'

export const metadata: Metadata = {
  title: 'Dental WhatsApp Automation in Mumbai',
  description: 'PatientFlow AI helps Mumbai clinics reduce no-shows using WhatsApp reminders and booking automation.',
}

export default function MumbaiPage() {
  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          PatientFlow AI for Mumbai Clinics
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Mumbai clinics use PatientFlow AI to keep front desks lighter while increasing attendance across high-volume schedules.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Why Mumbai clinics choose this flow</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Instant WhatsApp response for inbound treatment inquiries</li>
            <li>Reliable no-show reminder sequence at scale</li>
            <li>Clear ROI tracking with INR-based reporting</li>
          </ul>
        </div>
        <Link href="/login?next=/dashboard/billing" className="mt-8 inline-block">
          <TwentyOneButton>Subscribe now</TwentyOneButton>
        </Link>
      </div>
    </div>
  )
}
