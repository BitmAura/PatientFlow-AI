import { 
  Calendar, 
  MessageCircle, 
  Database,
  Clock3,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IntegrationsPage() {
  const integrations = [
    {
      icon: MessageCircle,
      name: "WhatsApp Providers (Gupshup + Meta)",
      category: "Communication",
      description: "Connect your clinic number and run outbound reminders plus inbound reply handling through supported WhatsApp providers.",
      popular: true
    },
    {
      icon: Calendar,
      name: "Calendar Actions",
      category: "Scheduling",
      description: "Generate calendar actions for confirmed appointments (Google/Outlook links and .ics download) from booking flows.",
      popular: true
    },
    {
      icon: Database,
      name: "Supabase (Auth + Postgres + RLS)",
      category: "Data",
      description: "Clinic data, tenant isolation, and authenticated application APIs are powered through Supabase."
    },
    {
      icon: Clock3,
      name: "Vercel Cron Automation",
      category: "Automation",
      description: "Scheduled jobs execute reminder, recall, and lead follow-up processing with secure cron secret protection."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 md:text-5xl">
            Seamless Integrations
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600">
            Connect PatientFlow AI with the tools you already use to run your clinic.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrations.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {item.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Popular
                  </div>
                )}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-zinc-900">{item.name}</h3>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{item.category}</span>
                </div>
                <p className="mb-6 flex-1 leading-relaxed text-zinc-600">
                  {item.description}
                </p>
                <Button variant="outline" className="w-full justify-between group" asChild>
                  <Link href="/login?next=/dashboard/billing">
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
      <section className="bg-zinc-900 py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Don&apos;t see your favorite tool?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-zinc-400">
            We are constantly adding new integrations. Contact our support team to request a specific integration for your clinic.
          </p>
          <Button size="lg" variant="secondary" className="h-14 rounded-full px-8" asChild>
            <Link href="/login?next=/dashboard/billing">Request Integration</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
