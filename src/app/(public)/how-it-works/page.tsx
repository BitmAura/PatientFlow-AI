import Link from 'next/link'
import { Calendar, MessageCircle, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
            Three Steps to <span className="text-green-600">Zero No-Shows</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Getting started with PatientFlow AI is effortless. We integrate directly with your existing workflow.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-24">
            <Step 
              number="01"
              title="Connect Your Calendar"
              description="Link your existing practice management software or Google Calendar. We sync appointments in real-time so you never have to enter data twice."
              icon={Calendar}
              align="left"
            />
            <Step 
              number="02"
              title="Customize Your Reminders"
              description="Set up your WhatsApp message templates. Choose when to send reminders (e.g., 24 hours before), what to say, and add quick-action buttons for confirming or rescheduling."
              icon={MessageCircle}
              align="right"
            />
            <Step 
              number="03"
              title="Watch Revenue Grow"
              description="Sit back as PatientFlow AI handles the communication. Patients confirm instantly, and cancelled slots are automatically offered to your waiting list."
              icon={TrendingUp}
              align="left"
            />
          </div>
        </div>
      </section>

      {/* Integration List */}
      <section className="border-y border-zinc-100 bg-zinc-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-3xl font-bold text-zinc-900">Works with your favorite tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-70">
            {['Google Calendar', 'Outlook', 'Cliniko', 'Jane App', 'Mindbody', 'Practice Better', 'SimplePractice', 'DrChrono'].map((tool) => (
              <div key={tool} className="flex items-center justify-center rounded-xl bg-white p-6 font-semibold text-zinc-700 shadow-sm">
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="Is PatientFlow AI HIPAA compliant?" 
              answer="Yes, we take data security seriously. All patient data is encrypted in transit and at rest, and we sign BAAs with covered entities."
            />
            <FAQItem 
              question="Can I use my own WhatsApp number?" 
              answer="Absolutely. You can link your existing WhatsApp Business number or we can provide a dedicated number for your practice."
            />
            <FAQItem 
              question="What happens if a patient replies?" 
              answer="Replies appear directly in your PatientFlow AI dashboard. You can also configure them to forward to your email or personal phone."
            />
            <FAQItem 
              question="Is there a setup fee?" 
              answer="No, there are no setup fees. You can start with our 14-day free trial and choose a plan that fits your practice size."
            />
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 text-center">
         <div className="container mx-auto px-4">
          <Link href="/signup?plan=starter">
            <Button size="lg" className="h-14 rounded-full bg-green-600 px-10 text-lg text-white shadow-lg shadow-green-600/20 hover:bg-green-500">
              Get Started with PatientFlow AI
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function Step({ number, title, description, icon: Icon, align }: { number: string; title: string; description: string; icon: any; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="text-6xl font-black text-zinc-100">{number}</div>
        <h3 className="text-3xl font-bold text-zinc-900">{title}</h3>
        <p className="text-lg leading-relaxed text-zinc-600">{description}</p>
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>Key benefit point {i}</span>
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
