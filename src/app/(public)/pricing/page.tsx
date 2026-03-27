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
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Simple, Transparent <span className="text-green-600">Pricing</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Choose the perfect plan for your practice. Reduce no-shows by 70% and recover lost revenue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
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
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border ${plan.popular ? 'border-green-600 bg-green-50/50 dark:bg-green-950/20 shadow-xl' : 'border-zinc-200 dark:border-zinc-800'} p-8 transition-all hover:shadow-lg`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-2">First {FREE_TRIAL_DAYS} days free</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/signup?plan=${plan.planId}`}>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900'}`}
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
            <div className="inline-block bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-6 py-3">
              <p className="text-green-800 dark:text-green-400 font-medium">
                💰 Save 20% with annual billing • Contact us for volume discounts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">
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
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Trusted by Healthcare Providers Across India
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Join hundreds of doctors and clinics saving thousands each month
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">70%</div>
              <p className="text-zinc-600 dark:text-zinc-400">Average reduction in no-shows</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">₹2.5L+</div>
              <p className="text-zinc-600 dark:text-zinc-400">Average monthly revenue recovered</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-zinc-600 dark:text-zinc-400">Active clinics using PatientFlow AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">
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
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Ready to Eliminate No-Shows?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Start your free {FREE_TRIAL_DAYS}-day trial today. No credit card required.
          </p>
          <Link href="/signup?plan=starter">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 text-lg shadow-lg shadow-green-600/20">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No credit card required • {FREE_TRIAL_DAYS}-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>&copy; 2024 PatientFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">{question}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{answer}</p>
    </div>
  )
}
