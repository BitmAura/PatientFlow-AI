import type { Metadata } from 'next'
import Link from 'next/link'
import { TwentyOneButton } from '@/components/ui/twentyone-button'

export const metadata: Metadata = {
  title: 'Dental WhatsApp Automation in Delhi',
  description: 'No Show Killer helps Delhi clinics reduce missed appointments with automated WhatsApp reminders and recall journeys.',
}

export default function DelhiPage() {
  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          No Show Killer for Delhi Clinics
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Delhi dental teams use No Show Killer to automate confirmations, reduce no-shows, and recover recall revenue with WhatsApp-first workflows.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Built for busy Delhi schedules</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Automated booking and reminder journeys for dental consultations</li>
            <li>Faster root canal confirmation without manual follow-up</li>
            <li>Structured recall campaigns for cleanings and reviews</li>
          </ul>
        </div>
        <Link href="/book-demo" className="mt-8 inline-block">
          <TwentyOneButton>Book Demo for Delhi Clinic</TwentyOneButton>
        </Link>
      </div>
    </div>
  )
}
