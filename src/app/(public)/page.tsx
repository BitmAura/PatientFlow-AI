import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, MessageSquare, Shield, Smartphone, Zap, UserPlus, CalendarX, Bell, Users, Lock, Activity, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              Trusted by Clinics Across India
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8">
              The Safe, Silent Way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Bring Patients Back</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              PatientFlow AI automatically identifies patients who missed their follow-ups and sends gentle, trustworthy WhatsApp reminders—so your clinic never loses a patient again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  How it works
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              The Silent Leak in Your Practice
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every day, clinics lose valuable revenue to simple oversights. Patients forget their 6-month checkups. Leads inquire but never book. Appointments are missed. Your staff is too busy to call everyone. This silent leak costs clinics lakhs every year.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProblemCard 
              icon={CalendarX}
              title="Missed Follow-ups"
              description="Patients who should have returned for routine care but simply forgot."
            />
            <ProblemCard 
              icon={AlertCircle}
              title="Appointment No-shows"
              description="Confirmed slots that go empty because reminders weren't seen."
            />
            <ProblemCard 
              icon={UserPlus}
              title="Forgotten Leads"
              description="New inquiries that slipped through the cracks before booking."
            />
            <ProblemCard 
              icon={Users}
              title="Lost Patients"
              description="Loyal patients who drifted away to competitors due to lack of contact."
            />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-zinc-50 dark:bg-black/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
                PatientFlow AI Quietly Fixes This
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                We built a system that watches your schedule so you don&apos;t have to. PatientFlow AI works in the background to identify patients who are due for a visit.
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                It sends them a polite, professional message on WhatsApp—the app they already use and trust. It feels like it came from your receptionist, but it happens automatically. If they book, great. If not, it gently nudges them again later.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Outcomes focused</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Zero friction</span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">Smart Detection</h4>
                    <p className="text-sm text-zinc-500 mt-1">Identifies a patient 6 months past their last cleaning.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">Gentle Nudge</h4>
                    <p className="text-sm text-zinc-500 mt-1">Sends a friendly WhatsApp: &quot;Hi Rahul, it&apos;s time for your checkup at City Dental.&quot;</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <CalendarX className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">Booking</h4>
                    <p className="text-sm text-zinc-500 mt-1">Patient replies and books a slot. Revenue recovered.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What PatientFlow AI Does Section */}
      <section id="features" className="py-24 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              Complete Patient Retention
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Four key ways we help your practice grow without adding work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Clock}
              title="Patient Recall"
              description="Automatically identifies and invites old patients back for their routine check-ups and follow-ups."
            />
            <FeatureCard 
              icon={UserPlus}
              title="Lead Follow-ups"
              description="Instantly engages new inquiries and leads so they don't drift away to your competitors."
            />
            <FeatureCard 
              icon={Shield}
              title="No-Show Reduction"
              description="Sends timely, polite reminders to ensure confirmed patients show up for their appointments."
            />
            <FeatureCard 
              icon={Bell}
              title="Staff Escalation"
              description="Smartly alerts your team only when a human touch is needed or automation fails."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-12">
              Why Clinics Trust PatientFlow AI
            </h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">No Spam</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Strict anti-spam rules ensure your patients are never annoyed. We prioritize patient relationships over aggressive marketing.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">No Extra Staff Work</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  The system runs 100% in the background. Your reception staff doesn&apos;t need to learn a new tool or click extra buttons.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Works Silently</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  You won&apos;t even notice it&apos;s there—until you see your appointment book filling up with returning patients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Stop Losing Revenue Today
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            It takes just 2 minutes to set up. No technical skills required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-blue-600 hover:bg-zinc-100 border-0 shadow-xl">
                  Get PatientFlow AI
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function ProblemCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800">
      <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
