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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-emerald-400/5 blur-[120px]" />
        
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-sm backdrop-blur-xl">
              🚀 Aura Vision Protocol v2.1 Activated
            </div>
            
            <h1 className="text-balance text-5xl font-black tracking-tight text-white lg:text-7xl">
              Turn Your Clinic's WhatsApp into a <span className="text-emerald-400">Revenue Generating</span> Machine.
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 lg:text-xl">
              Stop losing ₹40,000+ every month to no-shows. Recover leaked revenue with AI-driven patient recalls and automated dental follow-ups.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/enroll"
                className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-500 px-8 font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98] sm:w-auto"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <TrackedCtaLink
                href="#pricing"
                label="Explore Plans"
                location="homepage_hero"
                tone="secondary"
                className="h-14 w-full border-white/10 bg-white/5 px-8 font-bold text-white backdrop-blur-md hover:bg-white/10 sm:w-auto"
              >
                Explore Plans
              </TrackedCtaLink>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
              <StatChip label="Avg. Response Speed" value="< 5 Seconds" />
              <StatChip label="Recall Recovery" value="+28% Month 1" />
              <StatChip label="Compliance" value="DISHA Certified" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/40 to-teal-950/40 p-6 text-center shadow-lg backdrop-blur">
            <h2 className="text-2xl font-bold tracking-tight text-white">Early Access Program</h2>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
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

      <section className="py-14 md:py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Dental Clinics Lose High-Intent Patients
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
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

      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Conversion Engine for Dental WhatsApp Inquiries
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                PatientFlow AI runs a complete WhatsApp workflow from inquiry to confirmed dental consultation, with cleanings recall automation built in.
              </p>
              <div className="mt-6 space-y-3">
                {solutionPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-lg bg-slate-700/50 border border-slate-600/50 p-3 backdrop-blur">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-400" />
                    <p className="text-sm font-medium text-slate-200 sm:text-base">{point}</p>
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
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-800/40 p-6 shadow-2xl backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Visual Demo: WhatsApp Flow</h3>
              <p className="mt-1 text-sm text-slate-400">Example conversation from lead inquiry to confirmed dental consultation.</p>
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

      <section className="py-14 md:py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 shadow-2xl backdrop-blur sm:p-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">India-Market Trust Signals</h2>
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

      <section id="pricing" className="bg-slate-800 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple Pricing for Every Clinic Stage
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">Choose Starter, Growth, or Pro based on inquiry volume and branches.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-950 to-blue-950 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/50 to-slate-900/50 px-6 py-10 shadow-2xl backdrop-blur sm:px-10">
            <div className="mx-auto mb-3 inline-flex items-center rounded-full border border-cyan-400/50 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
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
                <Button size="lg" variant="outline" className="h-12 w-full border-cyan-400/50 bg-transparent px-7 text-base text-white hover:bg-cyan-950/50 hover:border-cyan-400 sm:w-auto">
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
    <div className="rounded-xl border border-cyan-400/30 bg-slate-800/50 backdrop-blur p-4 text-center shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl hover:border-cyan-400/50">
      <p className="text-xs font-medium uppercase tracking-wide text-cyan-300">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function ProblemCard({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-800/50 backdrop-blur p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl hover:border-cyan-400/50">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-500/30">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium leading-relaxed text-slate-200">{text}</p>
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
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-800/50 backdrop-blur p-5 text-left shadow-lg transition hover:border-cyan-400/50 hover:shadow-xl">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-500/30">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-lg font-semibold text-white">{value}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
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
      className={`rounded-2xl border p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${
        featured
          ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-950/50 to-slate-800/50 ring-2 ring-cyan-500/30 backdrop-blur'
          : 'border-cyan-500/30 bg-slate-800/50 backdrop-blur'
      }`}
    >
      {featured && (
        <div className="mb-3 inline-flex rounded-full bg-cyan-500/20 border border-cyan-400/50 px-3 py-1 text-xs font-semibold text-cyan-100">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="text-3xl font-bold tracking-tight text-white">{price}</span>
        {subtitle && <span className="pb-1 text-sm text-slate-400">{subtitle}</span>}
      </div>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
            <CalendarCheck2 className="mt-0.5 h-4 w-4 text-cyan-400" />
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
