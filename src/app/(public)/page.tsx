import Link from 'next/link'
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  MessageCircleMore,
  PhoneCall,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const solutionPoints = [
    'WhatsApp auto-replies for every inquiry',
    'Instant appointment booking links',
    'Multi-step follow-up automation',
    'Recall campaigns for old patients',
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₹3,999',
      subtitle: '/month',
      description: 'For single-doctor clinics getting started with automation.',
      features: [
        'Up to 500 conversations/month',
        'WhatsApp auto-replies',
        'Booking links + reminders',
        'Basic analytics dashboard',
      ],
      cta: 'Book Free Demo',
      featured: false,
    },
    {
      name: 'Growth',
      price: '₹8,999',
      subtitle: '/month',
      description: 'For fast-growing clinics focused on predictable bookings.',
      features: [
        'Up to 2,000 conversations/month',
        'Advanced follow-up sequences',
        'Recall + no-show prevention flows',
        'Conversion and staff performance tracking',
      ],
      cta: 'Book Free Demo',
      featured: true,
    },
    {
      name: 'Pro',
      price: 'Custom',
      subtitle: '',
      description: 'For multi-doctor and multi-location clinic groups.',
      features: [
        'Unlimited conversations',
        'Multi-branch automation',
        'Priority onboarding and support',
        'Custom integrations and reporting',
      ],
      cta: 'Book Free Demo',
      featured: false,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
              Built for dental, skin, and general clinics
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Turn Missed Inquiries into Booked Patients Automatically
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              PatientFlow AI uses WhatsApp automation to follow up, confirm, and convert patients without extra staff.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/book-demo">
                <Button size="lg" className="h-12 w-full px-7 text-base sm:w-auto">
                  Book Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg" className="h-12 w-full px-7 text-base sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <StatChip label="Avg. response time" value="< 10 sec" />
              <StatChip label="Demo-to-signup focus" value="ROI-first" />
              <StatChip label="Works with staff" value="No extra hires" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Clinics Lose High-Intent Patients
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Most clinics are not short on inquiries. They are short on instant, consistent follow-up.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProblemCard icon={WalletCards} text="Clinics lose 30-50% patients due to no follow-up." />
            <ProblemCard icon={Clock3} text="Front desk staff cannot respond instantly during busy hours." />
            <ProblemCard icon={PhoneCall} text="Leads go cold when there is no structured nurturing." />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                The Conversion Engine for Clinic Inquiries
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                PatientFlow AI runs a complete WhatsApp workflow from inquiry to confirmed appointment, with follow-ups and recalls built in.
              </p>
              <div className="mt-6 space-y-3">
                {solutionPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-medium text-slate-700 sm:text-base">{point}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <Link href="/book-demo">
                  <Button className="h-11 px-6">
                    Book Free Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Visual Demo: WhatsApp Flow</h3>
              <p className="mt-1 text-sm text-slate-500">Example conversation from lead inquiry to confirmed booking.</p>
              <div className="mt-5 rounded-2xl bg-[#ece5dd] p-4">
                <div className="rounded-xl bg-[#075e54] px-3 py-2 text-sm font-medium text-white">
                  PatientFlow AI Assistant
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <ChatBubble incoming text="Hi, do you have a skin consultation slot this week?" />
                  <ChatBubble outgoing text="Yes, we have slots tomorrow at 11:30 AM and 4:00 PM. Reply 1 or 2 to confirm." />
                  <ChatBubble incoming text="2" />
                  <ChatBubble outgoing text="Great! You're booked for tomorrow at 4:00 PM. Sharing location and prep details now." />
                  <ChatBubble outgoing text="Reminder set: We will ping you 24h and 2h before your appointment." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center sm:p-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Proven Results for Clinics</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard value="Recover 20-40% lost patients" description="Re-engage inquiries and past patients automatically." />
              <ResultCard value="Reduce no-shows by 50%" description="Increase attendance with smart reminder timing." />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-50 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple Pricing for Every Clinic Stage
            </h2>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">Choose Starter, Growth, or Pro based on inquiry volume and branches.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-800 px-6 py-10 sm:px-10">
            <div className="mx-auto mb-3 inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Performance Promise
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get Your First 10 Bookings Guaranteed
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              See exactly how PatientFlow AI fits your clinic process in a personalized demo.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/book-demo">
                <Button size="lg" className="h-12 w-full bg-emerald-500 px-7 text-base text-white hover:bg-emerald-600 sm:w-auto">
                  Book Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="h-12 w-full border-slate-500 bg-transparent px-7 text-base text-white hover:bg-slate-700 sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ProblemCard({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium leading-relaxed text-slate-700">{text}</p>
    </div>
  )
}

function ChatBubble({ incoming, outgoing, text }: { incoming?: boolean; outgoing?: boolean; text: string }) {
  const bubbleStyle = incoming
    ? 'bg-white text-slate-800 self-start rounded-bl-sm'
    : 'bg-[#dcf8c6] text-slate-800 self-end rounded-br-sm'

  return (
    <div className={`max-w-[90%] rounded-xl px-3 py-2 shadow-sm ${bubbleStyle}`}>
      <p className="leading-relaxed">{text}</p>
      {(incoming || outgoing) && <span className="mt-1 block text-right text-[10px] text-slate-500">10:24</span>}
    </div>
  )
}

function ResultCard({ value, description }: { value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-left shadow-sm">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
        <Sparkles className="h-4 w-4" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  subtitle,
  description,
  features,
  cta,
  featured,
}: {
  name: string
  price: string
  subtitle: string
  description: string
  features: string[]
  cta: string
  featured: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        featured ? 'border-emerald-400 bg-white ring-2 ring-emerald-100' : 'border-slate-200 bg-white'
      }`}
    >
      {featured && (
        <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{name}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{price}</span>
        {subtitle && <span className="pb-1 text-sm text-slate-500">{subtitle}</span>}
      </div>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
            <CalendarCheck2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/book-demo" className="mt-6 block">
        <Button className={`h-11 w-full ${featured ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
          <MessageCircleMore className="mr-2 h-4 w-4" />
          {cta}
        </Button>
      </Link>
    </div>
  )
}
