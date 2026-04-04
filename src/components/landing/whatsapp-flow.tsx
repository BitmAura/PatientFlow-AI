'use client'

import { CheckCircle2, ArrowRight } from 'lucide-react'
import { TrackedCtaLink } from '@/components/public/tracked-cta-link'

/**
 * WhatsApp Flow Demo Section
 * 📱 Persona: Product Designer
 * 🎨 Aura Vision (Light Mode) Aesthetic
 */
export function WhatsAppFlow() {
  const solutionPoints = [
    'WhatsApp auto-replies for every new dental inquiry',
    'Instant dental consultation booking links',
    'Root canal confirmation and reminder automation',
    'Recall patients for cleanings on autopilot',
  ]

  return (
    <section className="bg-white py-14 md:py-20 lg:py-28 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              The Conversion Engine for <span className="text-emerald-500">Dental WhatsApp</span> Inquiries
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
              PatientFlow AI runs a complete WhatsApp workflow from inquiry to confirmed dental consultation, with cleanings recall automation built in.
            </p>
            <div className="mt-8 space-y-4">
              {solutionPoints.map((point) => (
                <div key={point} className="flex items-start gap-4 rounded-2xl border border-emerald-50 bg-white p-4 shadow-xl shadow-emerald-500/5 dark:bg-slate-900/50 dark:border-emerald-900/20">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-600 sm:text-base dark:text-slate-300">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <TrackedCtaLink href="/book-demo" label="Book Free Demo" location="homepage_solution" className="h-14 px-8 text-base font-black">
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
              </TrackedCtaLink>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl dark:border-emerald-900/20 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Aura AI: Patient Assistant</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Live Clinical Flow</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              
              <div className="rounded-2xl bg-[#e5ddd5] p-5 shadow-inner dark:bg-slate-800/50 min-h-64">
                <div className="space-y-3 text-sm">
                  <ChatBubble incoming text="Hi, do you have a teeth cleaning appointment this week?" />
                  <ChatBubble text="Yes, Dr. Sharma has a slot tomorrow at 3 PM. Reply YES to confirm." />
                  <ChatBubble incoming text="YES" />
                  <ChatBubble text="Done. Your dental consultation is confirmed for tomorrow at 3 PM." />
                  <ChatBubble text="Root canal confirmation and cleaning recall reminders are also active." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChatBubble({ incoming, text }: { incoming?: boolean; text: string }) {
  const bubbleStyle = incoming
    ? 'bg-white text-slate-800 self-start rounded-bl-sm border-slate-100'
    : 'bg-[#dcf8c6] text-slate-800 self-end rounded-br-sm border-emerald-100'

  return (
    <div className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm border ${incoming ? 'mr-auto' : 'ml-auto'} ${bubbleStyle}`}>
      <p className="leading-relaxed font-medium">{text}</p>
      <span className="mt-1 block text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Now</span>
    </div>
  )
}
