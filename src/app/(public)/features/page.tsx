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
      description: "Intelligent booking system that fills gaps in your calendar and optimizes your daily schedule. Syncs with Google Calendar."
    },
    {
      icon: Shield,
      title: "Deposit Protection",
      description: "Secure your revenue by collecting deposits or holding card details for high-value appointments. Reduce late cancellations."
    },
    {
      icon: Zap,
      title: "Instant Recovery",
      description: "Automatically rebook cancelled slots by notifying waitlisted patients instantly. Never let a slot go to waste."
    },
    {
      icon: Smartphone,
      title: "Mobile First Dashboard",
      description: "Manage your practice from anywhere with our fully responsive mobile dashboard. Perfect for busy doctors on the go."
    },
    {
      icon: CheckCircle2,
      title: "Review Booster",
      description: "Automatically request reviews from satisfied patients to boost your online reputation and Google Maps ranking."
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
    <div className="bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
            Powerful Features for Modern Clinics
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need to streamline operations, reduce no-shows, and grow your healthcare practice.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
