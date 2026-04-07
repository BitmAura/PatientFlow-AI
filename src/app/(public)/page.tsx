import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { Hero } from '@/components/landing/hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { Pricing } from '@/components/landing/pricing'
import { WhatsAppFlow } from '@/components/landing/whatsapp-flow'
import { TrackedCtaLink } from '@/components/public/tracked-cta-link'
import { ArrowRight, Sparkles } from 'lucide-react'

import { AuraRoiSection } from '@/components/landing/aura-roi-wrapper'

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
  url: 'https://auradigitalservices.me',
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
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      {/* 🚀 Phase 1: High-Premium Hero */}
      <Hero />

      {/* 📊 Phase 2: Performance Features & Friction Audit */}
      <FeatureGrid />

      {/* ⚡ Phase 3: Dynamic ROI Engine (Lazy Loaded via Wrapper) */}
      <AuraRoiSection />

      {/* 📱 Phase 4: WhatsApp Live Flow Simulation */}
      <WhatsAppFlow />

      {/* 📈 Phase 5: High-Premium Pricing */}
      <Pricing />

      {/* 🏁 Phase 6: Final Performance Promise (CTA) */}
      <section className="bg-slate-50 py-16 md:py-24 lg:py-32 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <div className="relative mx-auto max-w-4xl rounded-[40px] border border-emerald-100 bg-white px-6 py-14 shadow-2xl shadow-emerald-500/5 dark:border-emerald-900/20 dark:bg-slate-900 sm:px-14">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-lg">
                <Sparkles className="h-3 w-3" />
                Performance Promise
            </div>
            
            <h2 className="text-balance text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Get Your First <span className="text-emerald-500">10 Bookings</span> Guaranteed.
            </h2>
            
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
              Stop guessing if your clinic is growing. See exactly how PatientFlow AI fits your clinical process in a personalized executive demo.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <TrackedCtaLink
                href="/login?next=/dashboard/billing"
                label="Subscribe now"
                location="homepage_bottom_cta"
                className="h-16 w-full px-10 text-base font-black sm:w-auto"
              >
                  Subscribe now
                  <ArrowRight className="ml-2 h-5 w-5" />
              </TrackedCtaLink>
              
              <TrackedCtaLink
                href="/signup"
                label="Start Free Trial"
                location="homepage_bottom_cta_secondary"
                tone="secondary"
                className="h-16 w-full border-slate-200 bg-white px-10 text-base font-bold text-slate-600 hover:bg-slate-50 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Start 14-Day Free Trial
              </TrackedCtaLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
