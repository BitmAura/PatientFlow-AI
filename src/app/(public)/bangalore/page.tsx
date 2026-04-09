import type { Metadata } from 'next'
import Link from 'next/link'
import { TwentyOneButton } from '@/components/ui/twentyone-button'

export const metadata: Metadata = {
  title: 'PatientFlow AI Bangalore — WhatsApp Automation for Clinics',
  description: 'Reduce clinic no-shows in Bangalore with WhatsApp automation built for managing city-wide appointment traffic.',
}

export default function BangalorePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SoftwareApplication"],
    "name": "PatientFlow AI Bangalore",
    "description": "WhatsApp automation engine to reduce appointment no-shows in Bangalore clinics.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "areaServed": "Bangalore"
  }

  return (
    <div className="bg-white py-14 md:py-20 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Reduce Clinic No-Shows in Bangalore with WhatsApp AI
        </h1>
        
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          Bangalore&apos;s infamous traffic is one of the biggest reasons for clinical no-shows and last-minute cancellations. <b>PatientFlow AI</b> is built to help dental and skin clinics in Indiranagar, Koramangala, and HSR Layout stay ahead of the gridlock by automating reminders and getting real-time confirmation over WhatsApp.
        </p>

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">Why Bangalore Clinics Trust Us</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
                <h3 className="font-semibold">Traffic-Aware Reminders</h3>
                <p className="text-sm text-slate-600 mt-2">Send automated alerts 2 hours before the slot to ensure patients leave on time.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
                <h3 className="font-semibold">Local Trust</h3>
                <p className="text-sm text-slate-600 mt-2">Over 40+ clinics in the city use our WhatsApp engine to manage their patient flow.</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Can it handle multiple clinic locations in Bangalore?</h3>
                <p className="text-slate-600">Yes, PatientFlow AI supports multi-location clinics with a unified dashboard.</p>
              </div>
              <div>
                <h3 className="font-semibold">Does it work with existing clinic software?</h3>
                <p className="text-slate-600">We offer easy CSV imports and direct API integrations for major practice management systems.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is the WhatsApp number from Bangalore?</h3>
                <p className="text-slate-600">You can use your local Bangalore clinic number or our shared high-reputation numbers.</p>
              </div>
              <div>
                <h3 className="font-semibold">How much revenue can I recover?</h3>
                <p className="text-slate-600">Most Bangalore dental clinics recover ₹35,000 - ₹50,000 per month by plugging no-show leaks.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is there a local support team?</h3>
                <p className="text-slate-600">Yes, our engineering and support teams are based right here in Bangalore.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center space-y-4">
          <Link href="/login?next=/dashboard/billing">
            <TwentyOneButton>Start Reducing No-Shows Today</TwentyOneButton>
          </Link>
          <p className="text-sm text-slate-500">Join 300+ Indian clinics on PatientFlow AI</p>
        </div>
      </div>
    </div>
  )
}
