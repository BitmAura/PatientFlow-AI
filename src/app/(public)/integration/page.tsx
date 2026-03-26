import { 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Mail, 
  Database,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IntegrationsPage() {
  const integrations = [
    {
      icon: MessageCircle,
      name: "WhatsApp Business API",
      category: "Communication",
      description: "Connect your official WhatsApp Business number to send automated reminders and chat with patients.",
      popular: true
    },
    {
      icon: Calendar,
      name: "Google Calendar",
      category: "Scheduling",
      description: "Two-way sync with Google Calendar. Appointments booked in PatientFlow AI appear in Google Calendar, and vice versa.",
      popular: true
    },
    {
      icon: CreditCard,
      name: "Stripe / Razorpay",
      category: "Payments",
      description: "Accept secure online payments for deposits or full consultations directly through your booking page."
    },
    {
      icon: Database,
      name: "Electronic Health Records (EHR)",
      category: "Data",
      description: "Sync patient data with popular EHR systems (Coming Soon). Import/Export patient lists easily."
    },
    {
      icon: Mail,
      name: "Email Services",
      category: "Communication",
      description: "Send professional HTML email confirmations and marketing campaigns to your patient list."
    }
  ]

  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
            Seamless Integrations
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Connect PatientFlow AI with the tools you already use to run your clinic.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrations.map((item, index) => (
              <div key={index} className="flex flex-col p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900 relative overflow-hidden">
                {item.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Popular
                  </div>
                )}
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-6">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{item.category}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                  {item.description}
                </p>
                <Button variant="outline" className="w-full justify-between group" asChild>
                  <Link href="/signup">
                    Connect
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 bg-zinc-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Don&apos;t see your favorite tool?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-10">
            We are constantly adding new integrations. Contact our support team to request a specific integration for your clinic.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8" asChild>
            <Link href="/contact">Request Integration</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
