import type { Metadata } from 'next'
import Link from 'next/link'
import { TwentyOneButton } from '@/components/ui/twentyone-button'

export const metadata: Metadata = {
  title: 'Dental WhatsApp Automation in Bangalore',
  description: 'PatientFlow AI helps Bangalore clinics reduce no-shows using WhatsApp reminders and automated booking flows.',
}

export default function BangalorePage() {
  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          PatientFlow AI for Bangalore Clinics
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Built in Bangalore, PatientFlow AI helps dental and skin clinics automate appointment reminders, recalls, and WhatsApp confirmations.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">What Bangalore teams use it for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Reduce no-shows with 24-hour and 1-hour WhatsApp reminders</li>
            <li>Recover cleaning recalls with repeat-safe automation</li>
            <li>Confirm high-value procedures faster over WhatsApp</li>
          </ul>
        </div>
        <Link href="/book-demo" className="mt-8 inline-block">
          <TwentyOneButton>Book Demo for Bangalore Clinic</TwentyOneButton>
        </Link>
      </div>
    </div>
  )
}
