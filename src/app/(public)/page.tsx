import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Landmark,
  Languages,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoiCalculator } from '@/components/public/roi-calculator'
import { TrackedCtaLink } from '@/components/public/tracked-cta-link'
import { PRICING_PLANS, formatPriceInrFromPaise } from '@/lib/billing/plans'

export const metadata: Metadata = {
  title: 'PatientFlow AI — Reduce Clinic No-Shows with WhatsApp Automation',
  description:
    'Indian dental and skin clinics use PatientFlow AI to recover ₹40,000+/month from missed appointments. WhatsApp reminders, SMS, email, online booking, patient recalls — built for Indian healthcare.',
  keywords: [
    'clinic appointment software India',
    'WhatsApp clinic automation',
    'reduce no-shows clinic India',
    'dental clinic management software',
    'patient recall system India',
    'appointment reminder WhatsApp India',
    'clinic no-show solution',
    'DISHA compliant clinic software',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PatientFlow AI — Stop Losing ₹40,000+/month to No-Shows',
    description:
      'WhatsApp reminders, online booking, and patient recalls for Indian clinics. 75% fewer no-shows. 14-day free trial.',
    url: '/',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'PatientFlow AI' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PatientFlow AI',
  applicationCategory: 'HealthcareApplication',
  operatingSystem: 'Web',
  url: 'https://aura-digital-services.vercel.app',
  description:
    'WhatsApp-powered clinic management software for Indian healthcare. Reduces no-shows by 75% with automated reminders, recalls, and online booking.',
  offers: {
    '@type': 'Offer',
    price: '2999',
    priceCurrency: 'INR',
    priceValidUntil: '2027-01-01',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '47',
  },
  provider: {
    '@type': 'Organization',
    name: 'Aura Digital Services',
    url: 'https://auradigitalservices.me',
  },
}

export default function LandingPage() {
  const solutionPoints = [
    'WhatsApp auto-replies for every new dental inquiry',
    'Instant dental consultation booking links',
    'Root canal confirmation and reminder automation',
    'Recall patients for cleanings on autopilot',
  ]

  const pricingPlans = [
    {
      name: PRICING_PLANS.starter.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise),
      subtitle: '/month',
      description: 'For single-doctor clinics starting WhatsApp automation.',
      features: [
        'Up to 500 conversations/month',
        'WhatsApp auto-replies for inquiries',
        'Dental consultation links + reminders',
        'Basic analytics dashboard',
      ],
      cta: 'Book Free Demo',
      featured: false,
    },
    {
      name: PRICING_PLANS.growth.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.growth.monthlyPricePaise),
      subtitle: '/month',
      description: 'For high-intent dental clinics focused on predictable bookings.',
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
      name: PRICING_PLANS.pro.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.pro.monthlyPricePaise),
      subtitle: '/month',
      description: 'For multi-doctor and multi-location healthcare groups.',
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

  const localBusinessSchema = jsonLd

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-300 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur">
              Built in India, for Indian healthcare teams
            </div>
            <h1 className="text-balance text-[clamp(2rem,6vw,4.2rem)] font-bold tracking-tight text-slate-900">
              Turn Your Dental Clinic&apos;s WhatsApp Into an Automated Booking Machine
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              Recover ₹40,000+/month from missed appointments. Built for Indian dental practices.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <TrackedCtaLink
                href="/book-demo"
                label="Book Free Demo"
                location="homepage_hero"
                className="w-full px-7 text-base sm:w-auto"
              >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
              <TrackedCtaLink
                href="#pricing"
                label="View Pricing"
                location="homepage_hero"
                tone="secondary"
                className="w-full px-7 text-base sm:w-auto"
              >
                  View Pricing
              </TrackedCtaLink>
            </div>
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <StatChip label="Avg. WhatsApp response" value="< 10 sec" />
              <StatChip label="Recall drop-off benchmark" value="30%" />
              <StatChip label="No-show benchmark (RCT)" value="20%" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Early Access Program</h2>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">
              Join 50 clinics in our pilot program. Limited spots: 15 remaining. Free for the first 60 days in exchange for feedback.
            </p>
            <div className="mt-5 inline-block">
              <TrackedCtaLink href="/book-demo" label="Reserve Pilot Spot" location="homepage_early_access">
                Reserve Pilot Spot
              </TrackedCtaLink>
            </div>
          </div>
        </div>
      </section>

      <RoiCalculator />

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Dental Clinics Lose High-Intent Patients
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Most dental teams are not short on inquiries. They are short on instant, consistent follow-up.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProblemCard icon={WalletCards} text="30% of cleaning recalls never book." />
            <ProblemCard icon={Clock3} text="20% no-show rate on RCT appointments hurts revenue consistency." />
            <ProblemCard icon={Stethoscope} text="Front desk gets buried in WhatsApp during peak hours." />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                The Conversion Engine for Dental WhatsApp Inquiries
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                PatientFlow AI runs a complete WhatsApp workflow from inquiry to confirmed dental consultation, with cleanings recall automation built in.
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
                <TrackedCtaLink href="/book-demo" label="Book Free Demo" location="homepage_solution" className="px-6">
                    Book Free Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </TrackedCtaLink>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
              <h3 className="text-lg font-semibold text-slate-900">Visual Demo: WhatsApp Flow</h3>
              <p className="mt-1 text-sm text-slate-500">Example conversation from lead inquiry to confirmed dental consultation.</p>
              <div className="mt-5 rounded-2xl bg-[#ece5dd] p-4">
                <div className="rounded-xl bg-[#075e54] px-3 py-2 text-sm font-medium text-white">
                  PatientFlow AI Assistant
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <ChatBubble incoming text="Hi, do you have a teeth cleaning appointment this week?" />
                  <ChatBubble outgoing text="Yes, Dr. Sharma has a slot tomorrow at 3 PM. Reply YES to confirm." />
                  <ChatBubble incoming text="YES" />
                  <ChatBubble outgoing text="Done. Your dental consultation is confirmed for tomorrow at 3 PM." />
                  <ChatBubble outgoing text="Root canal confirmation and cleaning recall reminders are also active." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">India-Market Trust Signals</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ResultCard value="Secure payments via Razorpay" description="All plans billed in INR with GST invoicing available." icon={Landmark} />
              <ResultCard value="GDPR-compliant handling" description="No patient data is shared with third parties." icon={ShieldCheck} />
              <ResultCard value="Regional language support" description="WhatsApp flows can support Hindi and Kannada workflows." icon={Languages} />
              <ResultCard value="Built in India" description="Bangalore-led product team serving clinics across India." icon={Building2} />
              <ResultCard value="Powered by Gupshup" description="Meta partner infrastructure for reliable WhatsApp delivery." icon={MessageCircleMore} />
              <ResultCard value="Hosted with secure infra" description="Production systems designed for healthcare-grade operations." icon={Sparkles} />
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
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              <TrackedCtaLink
                href="/book-demo"
                label="Book Free Demo"
                location="homepage_bottom_cta"
                className="w-full px-7 text-base sm:w-auto"
              >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
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
    <div className="rounded-xl border border-slate-200 bg-white/95 p-4 text-center shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ProblemCard({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
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

function ResultCard({
  value,
  description,
  icon: Icon = Sparkles,
}: {
  value: string
  description: string
  icon?: any
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-left shadow-sm">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon className="h-4 w-4" />
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
      className={`rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        featured
          ? 'border-emerald-400 bg-gradient-to-b from-white to-emerald-50/40 ring-2 ring-emerald-100'
          : 'border-slate-200 bg-white'
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
      <div className="mt-6 block">
        <TrackedCtaLink
          href="/book-demo"
          label={cta}
          location={`homepage_pricing_${name.toLowerCase()}`}
          tone={featured ? 'primary' : 'secondary'}
          className="h-11 w-full"
        >
          <MessageCircleMore className="mr-2 h-4 w-4" />
          {cta}
        </TrackedCtaLink>
      </div>
    </div>
  )
}
