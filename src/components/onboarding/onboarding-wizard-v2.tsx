'use client'

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Stethoscope, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Brain
} from "lucide-react"
import { completeOnboarding } from "@/app/onboarding/actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"

const STEPS = [
  { id: 'clinic', title: 'Clinic Identity', icon: Building2 },
  { id: 'services', title: 'Treatment Strategy', icon: Stethoscope },
  { id: 'ai', title: 'AI Assistant', icon: Brain },
  { id: 'summary', title: 'Confirm & Launch', icon: Sparkles }
]

export function OnboardingWizardV2({ userId }: { userId: string }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState({
    clinicName: '',
    doctorName: '',
    specialization: 'dental',
    treatments: [
      { name: 'Root Canal', price: 15000 },
      { name: 'Teeth Scaling', price: 2500 },
      { name: 'Implants', price: 45000 }
    ],
    botPersonality: 'friendly'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const currentStep = STEPS[stepIndex]
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex(prev => prev + 1)
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    const result = await completeOnboarding(userId, data)
    setIsSubmitting(false)

    if (result.success) {
      toast({ title: 'Welcome Aboard!', description: 'Your clinic is now live.' })
      router.push('/dashboard')
    } else {
      toast({ title: 'Setup Failed', description: result.error, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">
      {/* Dynamic Progress Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <TrendingUp className="h-4 w-4" />
          Production-Ready Config
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Let&apos;s build your practice engine.</h1>
        <div className="flex justify-between items-center max-w-lg mx-auto mb-2">
            {STEPS.map((s, idx) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        idx <= stepIndex ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 text-slate-400"
                    )}>
                        <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{s.title}</span>
                </div>
            ))}
        </div>
        <Progress value={progress} className="h-1.5 max-w-lg mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Form Area */}
        <Card className="lg:col-span-3 overflow-hidden shadow-2xl border-0 ring-1 ring-slate-200">
           <CardContent className="p-8">
              {stepIndex === 0 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <Label>Clinic Name</Label>
                        <Input 
                            placeholder="e.g. Kumars Microscopic Dentistry" 
                            className="h-12 text-lg" 
                            value={data.clinicName}
                            onChange={e => setData({...data, clinicName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Head Doctor (Owner)</Label>
                        <Input 
                            placeholder="Dr. Pradeep Kumar" 
                            className="h-12" 
                            value={data.doctorName}
                            onChange={e => setData({...data, doctorName: e.target.value})}
                        />
                    </div>
                    <Button onClick={handleNext} className="w-full h-12 text-lg" disabled={!data.clinicName || !data.doctorName}>
                        Continue Setup <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                      {data.treatments.map((t, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <Input value={t.name} className="flex-1 bg-white" />
                            <Input type="number" value={t.price} className="w-24 bg-white" />
                        </div>
                      ))}
                   </div>
                   <Button onClick={handleNext} className="w-full h-12 text-lg">
                        Confirm Treatments <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
                   <div className="grid grid-cols-2 gap-4">
                       {(['friendly', 'professional', 'direct']).map(p => (
                           <button 
                             key={p}
                             onClick={() => setData({...data, botPersonality: p})}
                             className={cn(
                                "p-6 rounded-2xl border-2 transition-all text-center",
                                data.botPersonality === p ? "border-blue-600 bg-blue-50 shadow-md" : "border-slate-100 hover:border-slate-300"
                             )}
                           >
                               <span className="block font-bold capitalize">{p}</span>
                           </button>
                       ))}
                   </div>
                   <Button onClick={handleNext} className="w-full h-12 text-lg">
                        Lock in Tone <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 text-center py-4">
                   <div className="bg-emerald-50 text-emerald-700 p-6 rounded-3xl border border-emerald-100">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Systems Ready.</h3>
                      <p className="text-sm opacity-80">WhatsApp Queue active. Reminders armed. Database synced.</p>
                   </div>
                   <Button 
                     onClick={handleFinish} 
                     disabled={isSubmitting}
                     className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                   >
                        {isSubmitting ? "Finalizing Core..." : "Launch Dashboard"}
                    </Button>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Strategy Context (Side Card) */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 text-white border-0 shadow-2xl">
                <CardContent className="p-8">
                    <Settings className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-4">Platform Blueprint</h3>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex gap-3">
                            <span className="text-blue-500 font-bold">1</span>
                            <span>Secure patient data under DISHA encryption guidelines.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-blue-500 font-bold">2</span>
                            <span>Official Meta Business API verification enabled.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-blue-500 font-bold">3</span>
                            <span>Automated failure retry with exponential backoff.</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Setup Time</p>
                <div className="text-3xl font-bold text-slate-900">~ 180 Seconds</div>
                <p className="text-sm text-slate-500 mt-2">We handle the servers, compliance, and messaging pipes.</p>
            </div>
        </div>
      </div>
    </div>
  )
}
