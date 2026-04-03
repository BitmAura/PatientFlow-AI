import React from 'react'
import Link from 'next/link'
import { Check, Bell, CheckCircle, BarChart2, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_45%,_#ffffff_75%)] py-20">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
            Three Steps to <span className="text-green-600">Zero No-Shows</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Getting started with PatientFlow AI is effortless. We integrate directly with your existing workflow.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-24">
            <Step
              number="01"
              title="Connect Your Clinic in 10 Minutes"
              description="Set up your WhatsApp number, add your doctors and services, and you're live. No IT team needed — our guided onboarding walks you through every step."
              align="left"
              points={[
                'Link your existing WhatsApp Business number',
                'Add doctors, services, and availability',
                'Set reminder templates in your clinic tone',
              ]}
              visual={<OnboardingMockup />}
            />
            <Step
              number="02"
              title="Automation Runs — You Do Nothing"
              description="PatientFlow AI sends WhatsApp reminders 24h and 3h before each appointment. If a patient no-shows, a recovery message goes out automatically within the hour."
              align="right"
              points={[
                'Automated 24h + 3h WhatsApp reminders',
                'No-show recovery sent within 60 minutes',
                'Post-visit follow-up for reviews and recalls',
              ]}
              visual={<WhatsAppMockup />}
            />
            <Step
              number="03"
              title="Watch Revenue Recover in Real Time"
              description="Your dashboard shows exactly how many patients confirmed, who no-showed, and how much revenue was recovered. Every week you see the impact."
              align="left"
              points={[
                'Live no-show rate and show-up tracking',
                'Monthly revenue recovery dashboard',
                'Waitlist fills open slots automatically',
              ]}
              visual={<DashboardMockup />}
            />
          </div>
        </div>
      </section>

      {/* Operations Stack */}
      <section className="border-y border-zinc-100 bg-zinc-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-3xl font-bold text-zinc-900">Built Around Real Clinic Workflows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-70">
            {[
              'WhatsApp Messaging',
              'Reminder Settings',
              'No-Show Recovery',
              'Waitlist Management',
              'Booking Pages',
              'Patient Follow-ups',
              'Impact Dashboard',
              'Clinic Team Access',
            ].map((tool) => (
              <div key={tool} className="flex items-center justify-center rounded-xl bg-white p-6 font-semibold text-zinc-700 shadow-sm">
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="Is PatientFlow AI secure for clinic data?" 
              answer="Yes. We use encryption in transit and at rest, role-based access controls, and tenant-isolated data policies. Workflows are designed to support Indian healthcare data handling expectations, including DISHA-aligned practices."
            />
            <FAQItem 
              question="Can I use my own WhatsApp number?" 
              answer="Absolutely. You can link your existing WhatsApp Business number or we can provide a dedicated number for your practice."
            />
            <FAQItem 
              question="What happens if a patient replies?" 
              answer="Replies are captured in PatientFlow AI and can trigger your follow-up workflows. Your staff can continue handling responses from the dashboard process."
            />
            <FAQItem 
              question="Is there a setup fee?" 
              answer="No, there are no setup fees. You can start with our 14-day free trial and choose a plan that fits your practice size."
            />
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 text-center">
         <div className="container mx-auto px-4">
          <Link href="/signup?plan=starter">
            <Button size="lg" className="h-14 rounded-full bg-green-600 px-10 text-lg text-white shadow-lg shadow-green-600/20 hover:bg-green-500">
              Get Started with PatientFlow AI
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  align,
  points,
  visual,
}: {
  number: string
  title: string
  description: string
  align: 'left' | 'right'
  points: string[]
  visual: React.ReactNode
}) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-6">
        <div className="text-6xl font-black text-zinc-100">{number}</div>
        <h3 className="text-3xl font-bold text-zinc-900">{title}</h3>
        <p className="text-lg leading-relaxed text-zinc-600">{description}</p>
        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-zinc-600">
              <Check className="h-5 w-5 text-green-600 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full">
        {visual}
      </div>
    </div>
  )
}

// ── Visual mockups ────────────────────────────────────────────────

function OnboardingMockup() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 bg-zinc-100 px-4 py-3 border-b border-zinc-200">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-4 text-xs text-zinc-400">PatientFlow AI — Onboarding</span>
      </div>
      <div className="p-6 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {['Clinic Details', 'WhatsApp', 'Done'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? 'bg-green-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                {i < 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs ${i < 2 ? 'text-green-700 font-medium' : 'text-zinc-400'}`}>{s}</span>
              {i < 2 && <div className={`h-0.5 w-6 ${i < 1 ? 'bg-green-400' : 'bg-zinc-200'}`} />}
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">WhatsApp Connected</p>
          <p className="text-xs text-green-600">+91 98765 43210 · Verified Business Number</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Dr. Sharma', 'Dr. Patel'].map(d => (
            <div key={d} className="rounded-lg border border-zinc-200 p-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{d[3]}</div>
              <span className="text-xs font-medium text-zinc-700">{d}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-zinc-900 text-green-400 px-4 py-3 text-xs font-mono">
          ✓ Reminders configured · ✓ Booking page live
        </div>
      </div>
    </div>
  )
}

function WhatsAppMockup() {
  const messages = [
    { from: 'clinic', text: 'Hi Rahul, reminder: your appointment at Smile Dental is tomorrow at 11:00 AM. Reply YES to confirm.', time: '9:00 AM' },
    { from: 'patient', text: 'YES', time: '9:05 AM' },
    { from: 'clinic', text: 'Confirmed! See you tomorrow at 11 AM. Reply RESCHEDULE if plans change.', time: '9:05 AM' },
  ]
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
      {/* WhatsApp header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">SD</div>
        <div>
          <p className="text-sm font-semibold">Smile Dental Clinic</p>
          <p className="text-xs text-white/70">Official WhatsApp Business</p>
        </div>
      </div>
      {/* Chat */}
      <div className="bg-[#ECE5DD] p-4 space-y-3 min-h-[200px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'clinic' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs shadow-sm ${m.from === 'clinic' ? 'bg-white text-zinc-800' : 'bg-[#DCF8C6] text-zinc-800'}`}>
              <p>{m.text}</p>
              <p className="text-right text-[10px] text-zinc-400 mt-1">{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Auto badge */}
      <div className="border-t border-zinc-100 px-4 py-2 bg-white flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-green-500" />
        <span className="text-xs text-zinc-500">Sent automatically by PatientFlow AI</span>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 bg-zinc-100 px-4 py-3 border-b border-zinc-200">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-4 text-xs text-zinc-400">PatientFlow AI — Dashboard</span>
      </div>
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Show Rate', value: '94%', delta: '+31%', icon: Users, color: 'text-green-600 bg-green-50' },
            { label: 'No-Shows', value: '4', delta: '-18', icon: Bell, color: 'text-amber-600 bg-amber-50' },
            { label: 'Recovered', value: '₹52K', delta: 'this month', icon: BarChart2, color: 'text-blue-600 bg-blue-50' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-zinc-100 p-3">
              <div className={`h-7 w-7 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-zinc-900">{s.value}</p>
              <p className="text-[10px] text-zinc-400">{s.label}</p>
              <p className="text-[10px] text-green-600 font-medium">{s.delta}</p>
            </div>
          ))}
        </div>
        {/* Mini appointment list */}
        <div className="space-y-1.5">
          {[
            { name: 'Priya Sharma', time: '10:00 AM', status: 'confirmed' },
            { name: 'Rahul Verma', time: '11:30 AM', status: 'confirmed' },
            { name: 'Meena Joshi', time: '2:00 PM', status: 'pending' },
          ].map(a => (
            <div key={a.name} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{a.name[0]}</div>
                <span className="text-xs font-medium text-zinc-700">{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400">{a.time}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-green-200">
      <h3 className="mb-2 text-lg font-semibold text-zinc-900">{question}</h3>
      <p className="text-zinc-600">{answer}</p>
    </div>
  )
}
