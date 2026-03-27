import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-24">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-8 text-4xl font-medium tracking-tight text-zinc-900 md:text-5xl">
              Helping clinics recover revenue with discipline and care.
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-600">
              We build systems that stop patient leakage without adding to your staff&apos;s workload. 
              Simple, reliable, and built specifically for Indian clinics.
            </p>
          </div>
        </div>
      </section>

      {/* Why PatientFlow AI was built */}
      <section className="bg-zinc-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-center text-2xl font-semibold text-zinc-900">Why we built PatientFlow AI</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900">Silent Patient Loss</h3>
                <p className="leading-relaxed text-zinc-600">
                  Most clinics don&apos;t realize how many patients simply drift away. It happens quietly, day by day, resulting in significant revenue loss over time.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900">Staff Overload</h3>
                <p className="leading-relaxed text-zinc-600">
                  Front desk staff are often overwhelmed with daily operations. Expecting them to manually track and follow up with every past patient is unrealistic.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900">Forgotten Follow-ups</h3>
                <p className="leading-relaxed text-zinc-600">
                  Without a system, follow-ups rely on memory or sticky notes. Critical recalls for treatments are missed, affecting both patient health and clinic revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-center text-2xl font-semibold text-zinc-900">Our Philosophy</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-900">1</div>
                <div>
                  <h3 className="mb-3 text-xl font-medium text-zinc-900">Automation should support humans</h3>
                  <p className="text-lg leading-relaxed text-zinc-600">
                    Technology shouldn&apos;t replace the personal touch of your clinic. It should handle the repetitive, administrative tasks so your staff can focus on the patients in front of them.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-900">2</div>
                <div>
                  <h3 className="mb-3 text-xl font-medium text-zinc-900">Patients should not feel pressured</h3>
                  <p className="text-lg leading-relaxed text-zinc-600">
                    We believe in gentle, timely reminders. Communication should be helpful and caring, never aggressive or spammy. Trust is hard to build and easy to lose.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-900">3</div>
                <div>
                  <h3 className="mb-3 text-xl font-medium text-zinc-900">Clinics should not lose money quietly</h3>
                  <p className="text-lg leading-relaxed text-zinc-600">
                    Revenue leaks should be visible and fixable. We provide the clarity and tools needed to stop the silent loss of potential revenue from existing patients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-12">Who is PatientFlow AI for?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-zinc-800 border border-zinc-700">
                <h3 className="text-lg font-medium mb-2">Clinics</h3>
                <p className="text-zinc-400 text-sm">Seeking to professionalize their operations and improve patient retention.</p>
              </div>
              <div className="p-6 rounded-xl bg-zinc-800 border border-zinc-700">
                <h3 className="text-lg font-medium mb-2">Dental Practices</h3>
                <p className="text-zinc-400 text-sm">Where regular check-ups and follow-ups are critical for long-term care.</p>
              </div>
              <div className="p-6 rounded-xl bg-zinc-800 border border-zinc-700">
                <h3 className="text-lg font-medium mb-2">Hospitals</h3>
                <p className="text-zinc-400 text-sm">Managing high volumes of patients where manual tracking is impossible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 bg-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-medium text-zinc-900">Stop the silent loss.</h2>
          <Link href="/signup">
            <Button size="lg" className="h-12 rounded-full bg-zinc-900 px-8 text-base font-medium text-white shadow-md hover:bg-zinc-800">
              Get Started with PatientFlow AI
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
