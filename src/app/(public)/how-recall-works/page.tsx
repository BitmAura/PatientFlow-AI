import { Search, MessageCircle, Users, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HowRecallWorksPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
            How PatientFlow AI Works
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600">
            A simple, automated system to bring your patients back—without adding work for your staff.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-24">
            <Step 
              number="01"
              title="Identify missed patients and leads"
              description="PatientFlow AI quietly scans your records to find opportunities you might have missed. We look for patients overdue for check-ups and inquiries that haven't been fully followed up."
              points={[
                "Patients who didn’t return",
                "Leads that were not followed up"
              ]}
              icon={Search}
              align="left"
            />
            <Step 
              number="02"
              title="Automatic WhatsApp follow-ups"
              description="We send friendly, personalized messages to these patients. It looks and feels exactly like a message from your front desk, maintaining your clinic&apos;s professional image."
              points={[
                "Gentle, professional reminders",
                "No spam"
              ]}
              icon={MessageCircle}
              align="right"
            />
            <Step 
              number="03"
              title="Staff steps in only when needed"
              description="Your team doesn&apos;t need to chase anyone. PatientFlow AI notifies your staff only when a patient replies or if a specific case needs personal attention."
              points={[
                "Missed responses",
                "High-risk cases"
              ]}
              icon={Users}
              align="left"
            />
            <Step 
              number="04"
              title="Revenue recovery"
              description="Watch your calendar fill up with returning patients. By automating the follow-up process, you ensure a steady stream of appointments and reduce lost revenue."
              points={[
                "More returning patients",
                "Fewer no-shows",
                "Better discipline"
              ]}
              icon={TrendingUp}
              align="right"
            />
          </div>
        </div>
      </section>

      {/* WhatsApp Setup */}
      <section className="border-t border-zinc-100 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">
              Simple, Secure WhatsApp Connection
            </h2>
            <p className="text-lg text-zinc-600">
              We connect your clinic&apos;s existing number to the official WhatsApp Business platform.
            </p>
          </div>

          <div className="rounded-3xl border border-green-100 bg-green-50/60 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <ul className="space-y-4">
                  {[
                    "Messages are sent from your clinic&apos;s own WhatsApp number",
                    "Your number is upgraded to the official Business platform",
                    "All chats and replies appear directly inside PatientFlow AI",
                    "Quick setup via a one-time code or phone call",
                    "Your phone doesn&apos;t need to be online for messages to send"
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                      <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-6">
                <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    Peace of Mind Guarantee
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    We know your phone number is the lifeline of your practice. By upgrading it to this professional platform, you gain stability and multiple-staff access without relying on a physical phone battery or internet connection. Your number remains yours, and you can disconnect at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="Can I cancel anytime?" 
              answer="Yes, absolutely. There are no long-term contracts or lock-in periods. You can cancel your subscription at any time with a single click."
            />
            <FAQItem 
              question="What happens to my WhatsApp number?" 
              answer="Your number belongs to you, not us. If you cancel, we will disconnect your number from our platform so you can take it back. We do not hold your number hostage."
            />
            <FAQItem 
              question="Can I use the same number on normal WhatsApp again?" 
              answer="Yes. After we disconnect it from our system, you can register it again on the standard WhatsApp or WhatsApp Business app on your phone."
            />
            <FAQItem 
              question="How long does it take after cancellation?" 
              answer="Disconnection from our side is immediate. However, WhatsApp sometimes has a short 'cooldown' period (usually less than 30 minutes) before you can re-verify the number on your phone."
            />
            <FAQItem 
              question="Is there any charge to disconnect?" 
              answer="No. We do not charge any exit fees or disconnection fees. We want you to stay because you love the results, not because you're stuck."
            />
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="bg-zinc-50 py-20 text-center">
         <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-zinc-900">
            Ready to recover lost revenue?
          </h2>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-10 h-14 text-lg shadow-lg shadow-green-600/20">
            <Link href="/signup">
              Start Your Free Trial
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function Step({ number, title, description, points, icon: Icon, align }: { number: string; title: string; description: string; points: string[]; icon: any; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="text-6xl font-black text-zinc-100">{number}</div>
        <h3 className="text-3xl font-bold text-zinc-900">{title}</h3>
        <p className="text-lg leading-relaxed text-zinc-600">{description}</p>
        <ul className="space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-center gap-3 font-medium text-zinc-700">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-zinc-100 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
          <Icon className="h-24 w-24 text-green-600 opacity-80" />
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-green-200">
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">{question}</h3>
      <p className="text-zinc-600">{answer}</p>
    </div>
  )
}
