import { 
  MessageSquare, 
  Clock, 
  Shield, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  Calendar, 
  Users, 
  BarChart3 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Automation",
      description: "Send automated reminders, confirmations, and follow-ups directly to your patients' favorite app. Reduce manual calls and texts."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Clinic booking flows with doctor/service availability and slot selection to reduce manual coordination."
    },
    {
      icon: Shield,
      title: "Deposit Protection",
      description: "Secure your revenue by collecting deposits or holding card details for high-value appointments. Reduce late cancellations."
    },
    {
      icon: Zap,
      title: "Instant Recovery",
      description: "Staff-assisted waitlist recovery tools to notify matched patients and convert open slots into confirmed appointments."
    },
    {
      icon: Smartphone,
      title: "Mobile First Dashboard",
      description: "Manage your practice from anywhere with our fully responsive mobile dashboard. Perfect for busy doctors on the go."
    },
    {
      icon: CheckCircle2,
      title: "Review Booster",
      description: "Post-visit follow-up messages can request feedback and reviews with clinic-controlled templates."
    },
    {
      icon: Calendar,
      title: "Online Booking",
      description: "Give patients a beautiful, branded booking page where they can schedule appointments 24/7 without calling."
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Keep all patient records, history, and communication logs in one secure place. searchable and accessible."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track no-show rates, revenue, and growth with detailed reports. Make data-driven decisions for your practice."
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold text-zinc-900 md:text-5xl">
            Powerful Features for Modern Clinics
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600">
            Everything you need to streamline operations, reduce no-shows, and grow your healthcare practice.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-zinc-900">{feature.title}</h3>
                <p className="leading-relaxed text-zinc-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to transform your practice?
          </h2>
          <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-green-600 hover:bg-zinc-100 border-0 shadow-xl" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
