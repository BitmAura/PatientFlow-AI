import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white mb-8">
              Helping clinics recover revenue with discipline and care.
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              We build systems that stop patient leakage without adding to your staff&apos;s workload. 
              Simple, reliable, and built specifically for Indian clinics.
            </p>
          </div>
        </div>
      </section>

      {/* Why Aura Recall was built */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-12 text-center">Why we built Aura Recall</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Silent Patient Loss</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Most clinics don&apos;t realize how many patients simply drift away. It happens quietly, day by day, resulting in significant revenue loss over time.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Staff Overload</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Front desk staff are often overwhelmed with daily operations. Expecting them to manually track and follow up with every past patient is unrealistic.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Forgotten Follow-ups</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-12 text-center">Our Philosophy</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-medium">1</div>
                <div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-3">Automation should support humans</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    Technology shouldn&apos;t replace the personal touch of your clinic. It should handle the repetitive, administrative tasks so your staff can focus on the patients in front of them.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-medium">2</div>
                <div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-3">Patients should not feel pressured</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    We believe in gentle, timely reminders. Communication should be helpful and caring, never aggressive or spammy. Trust is hard to build and easy to lose.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-medium">3</div>
                <div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-3">Clinics should not lose money quietly</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    Revenue leaks should be visible and fixable. We provide the clarity and tools needed to stop the silent loss of potential revenue from existing patients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-12">Who is Aura for?</h2>
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
      <section className="py-24 bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-medium text-zinc-900 dark:text-white mb-8">Stop the silent loss.</h2>
          <Link href="/signup">
            <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-full px-8 h-12 text-base font-medium">
              Get Started with Aura Recall
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
