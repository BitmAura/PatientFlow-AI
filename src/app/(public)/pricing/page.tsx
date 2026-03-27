import Link from 'next/link'
import { Check, Phone, MessageCircle, Calendar, Shield, Zap, Users, BarChart3, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FREE_TRIAL_DAYS, PRICING_PLANS, formatPriceInrFromPaise } from '@/lib/billing/plans'

export default function PricingPage() {
  const plans = [
    {
      name: PRICING_PLANS.starter.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise),
      period: '/month',
      description: 'For doctors and small clinics',
      planId: 'starter',
      features: [
        'Up to 500 appointments/month',
        'Up to 3 doctors',
        'WhatsApp + SMS + Email reminders',
        'Online booking page',
        'Razorpay deposits integration',
        'Waiting list automation',
        'Patient recall system',
        'Detailed analytics dashboard',
        'Email & chat support'
      ],
      popular: true
    },
    {
      name: PRICING_PLANS.growth.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.growth.monthlyPricePaise),
      period: '/month',
      description: 'For scaling clinics and multi-doctor practices',
      planId: 'growth',
      features: [
        'Up to 2,000 appointments/month',
        'Up to 10 doctors & staff',
        'Campaign automation workflows',
        'Advanced recall system',
        'Advanced automation workflows',
        'Custom integrations (EMR, billing)',
        'Priority feature requests',
        'Dedicated account manager',
        '24/7 phone & WhatsApp support',
        'DISHA compliance tools',
        'Custom reports & analytics'
      ],
      popular: false
    },
    {
      name: PRICING_PLANS.pro.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.pro.monthlyPricePaise),
      period: '/month',
      description: 'For multi-location clinics and hospital groups',
      planId: 'pro',
      features: [
        'Unlimited appointments',
        'Unlimited doctors and staff',
        'Multi-location management',
        'Advanced automation and API access',
        'Custom integrations and reporting',
        'Priority support and SLA options'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Simple, Transparent <span className="text-green-600">Pricing</span>
          </h1>
          <p className="mb-8 text-xl text-slate-600">
            Choose the perfect plan for your practice. Reduce no-shows by 70% and recover lost revenue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{FREE_TRIAL_DAYS}-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <PricingSignal value="70%" label="No-show reduction target" />
            <PricingSignal value="< 10s" label="Lead response benchmark" />
            <PricingSignal value="14 days" label="Risk-free evaluation" />
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? 'border-green-500 bg-gradient-to-b from-white to-green-50/50 shadow-xl shadow-green-500/10 ring-2 ring-green-100'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="mb-4 text-slate-600">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-2">First {FREE_TRIAL_DAYS} days free</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/signup?plan=${plan.planId}`}>
                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20 hover:bg-green-500'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Annual Discount Banner */}
          <div className="mt-12 text-center">
            <div className="inline-block rounded-full border border-green-200 bg-green-100 px-6 py-3">
              <p className="font-medium text-green-800">
                💰 Save 20% with annual billing • Contact us for volume discounts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Everything You Need to Reduce No-Shows
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MessageCircle}
              title="WhatsApp Automation"
              description="Automated reminders, confirmations, and follow-ups via WhatsApp Business API"
            />
            <FeatureCard 
              icon={Calendar}
              title="Smart Scheduling"
              description="Intelligent booking system that fills gaps and optimizes your schedule"
            />
            <FeatureCard 
              icon={Shield}
              title="Razorpay Deposits"
              description="Secure your revenue with advance deposits via Razorpay integration"
            />
            <FeatureCard 
              icon={Phone}
              title="Multi-channel Reminders"
              description="SMS, email, and WhatsApp integration for maximum patient reach"
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Recovery"
              description="Automatically rebook cancelled slots from waiting list"
            />
            <FeatureCard 
              title="Detailed Analytics"
              description="Track no-show rates, revenue recovery, and patient engagement"
              icon={BarChart3}
            />
            <FeatureCard 
              icon={Users}
              title="Patient Portal"
              description="Self-service booking and appointment management for patients"
            />
            <FeatureCard 
              icon={Clock}
              title="Recall System"
              description="Automated follow-ups for patients due for checkups"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              Trusted by Healthcare Providers Across India
            </h2>
            <p className="text-slate-600">
              Join hundreds of doctors and clinics saving thousands each month
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">70%</div>
              <p className="text-slate-600">Average reduction in no-shows</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">₹2.5L+</div>
              <p className="text-slate-600">Average monthly revenue recovered</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-slate-600">Active clinics using PatientFlow AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQItem 
              question="Is the trial really free?"
              answer={`Yes! No credit card required. Get full access to all features for ${FREE_TRIAL_DAYS} days.`}
            />
            <FAQItem 
              question="What happens after the trial?"
              answer="We'll send you a reminder before your trial ends. You can choose to upgrade to a paid plan or continue with limited free features."
            />
            <FAQItem 
              question="Can I change plans later?"
              answer="Absolutely! Upgrade or downgrade anytime. Changes take effect immediately."
            />
            <FAQItem 
              question="Do you charge per message?"
              answer="WhatsApp message costs are included in your plan up to your appointment limit. Additional messages are charged at ₹0.08 per message."
            />
            <FAQItem 
              question="Is my patient data secure?"
              answer="Yes. We follow DISHA (India's Digital Information Security in Healthcare Act) guidelines and use bank-grade encryption."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold text-slate-900">
            Ready to Eliminate No-Shows?
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Start your free {FREE_TRIAL_DAYS}-day trial today. No credit card required.
          </p>
          <Link href="/signup?plan=starter">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 text-lg shadow-lg shadow-green-600/20">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            No credit card required • {FREE_TRIAL_DAYS}-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2024 PatientFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  )
}

function PricingSignal({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}
