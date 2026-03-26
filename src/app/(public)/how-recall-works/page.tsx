import { Search, MessageCircle, Users, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HowRecallWorksPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            How Aura Recall Works
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
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
              description="Aura quietly scans your records to find opportunities you might have missed. We look for patients overdue for check-ups and inquiries that haven't been fully followed up."
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
              description="Your team doesn&apos;t need to chase anyone. Aura Recall notifies your staff only when a patient replies or if a specific case needs personal attention."
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
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Simple, Secure WhatsApp Connection
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              We connect your clinic&apos;s existing number to the official WhatsApp Business platform.
            </p>
          </div>

          <div className="bg-green-50/50 dark:bg-green-900/10 rounded-3xl p-8 md:p-12 border border-green-100 dark:border-green-900/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <ul className="space-y-4">
                  {[
                    "Messages are sent from your clinic&apos;s own WhatsApp number",
                    "Your number is upgraded to the official Business platform",
                    "All chats and replies appear directly inside Aura Recall",
                    "Quick setup via a one-time code or phone call",
                    "Your phone doesn&apos;t need to be online for messages to send"
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-700 dark:text-green-300" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/20">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Peace of Mind Guarantee
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
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
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-12 text-center">Frequently Asked Questions</h2>
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
      <section className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/30">
         <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
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
        <div className="text-6xl font-black text-zinc-100 dark:text-zinc-800">{number}</div>
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-medium">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-xl">
          <Icon className="h-24 w-24 text-green-600 opacity-80" />
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-green-200 dark:hover:border-green-900 transition-colors">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{question}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{answer}</p>
    </div>
  )
}
