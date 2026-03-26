import { Calendar, MessageCircle, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Three Steps to <span className="text-green-600">Zero No-Shows</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
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
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-12">Works with your favorite tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-70">
            {['Google Calendar', 'Outlook', 'Cliniko', 'Jane App', 'Mindbody', 'Practice Better', 'SimplePractice', 'DrChrono'].map((tool) => (
              <div key={tool} className="flex items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-12 text-center">Frequently Asked Questions</h2>
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
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-10 h-14 text-lg shadow-lg shadow-green-600/20">
            Get Started with PatientFlow AI
          </Button>
        </div>
      </section>
    </div>
  )
}

function Step({ number, title, description, icon: Icon, align }: { number: string; title: string; description: string; icon: any; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="text-6xl font-black text-zinc-100 dark:text-zinc-800">{number}</div>
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
              <Check className="h-5 w-5 text-green-600" />
              <span>Key benefit point {i}</span>
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
