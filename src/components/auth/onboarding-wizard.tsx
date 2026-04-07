'use client'

import * as React from 'react'
import { ClinicDetailsStep } from './onboarding-steps/clinic-details-step'
import { AddressStep } from './onboarding-steps/address-step'
import { WhatsAppStep } from './onboarding-steps/whatsapp-step'
import { FirstDoctorStep } from './onboarding-steps/first-doctor-step'
import { FirstServiceStep } from './onboarding-steps/first-service-step'
import { CompleteStep } from './onboarding-steps/complete-step'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'
import {
  CheckCircle2,
  Building2,
  MapPin,
  MessageCircle,
  UserRound,
  Stethoscope,
  Sparkles,
} from 'lucide-react'

const STEPS = [
  { id: 'details',   title: 'Clinic',       icon: Building2,     description: 'Basic info about your clinic' },
  { id: 'address',   title: 'Location',     icon: MapPin,        description: 'Address & contact details' },
  { id: 'whatsapp',  title: 'WhatsApp',     icon: MessageCircle, description: 'Activate automated reminders' },
  { id: 'doctor',    title: 'First Doctor', icon: UserRound,     description: 'Add your first doctor' },
  { id: 'service',   title: 'First Service',icon: Stethoscope,   description: 'Add a service to book' },
  { id: 'complete',  title: 'All Done!',    icon: Sparkles,      description: 'You\'re ready to go' },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState<Record<string, unknown>>({})

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSkip = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8 space-y-4">
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isDone = index < currentStep
            const isActive = index === currentStep

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isDone
                        ? 'border-green-500 bg-green-500 text-white'
                        : isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'hidden text-[10px] font-semibold sm:block',
                      isActive
                        ? 'text-primary'
                        : isDone
                        ? 'text-green-600'
                        : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="mb-5 flex-1 px-1">
                    <div className="h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={cn(
                          'h-full rounded-full bg-green-500 transition-all duration-500',
                          index < currentStep ? 'w-full' : 'w-0'
                        )}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step label + progress bar */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{STEPS[currentStep].title}</span>
          <span className="text-xs">
            Step {currentStep + 1} of {STEPS.length} &mdash; {STEPS[currentStep].description}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        {currentStep === 0 && (
          <ClinicDetailsStep onNext={handleNext} defaultValues={formData} />
        )}
        {currentStep === 1 && (
          <AddressStep onBack={handleBack} onNext={handleNext} defaultValues={formData} />
        )}
        {currentStep === 2 && (
          <WhatsAppStep onBack={handleBack} onNext={handleNext} defaultValues={formData} />
        )}
        {currentStep === 3 && (
          <FirstDoctorStep
            onBack={handleBack}
            onNext={handleNext}
            onSkip={handleSkip}
            defaultValues={formData}
          />
        )}
        {currentStep === 4 && (
          <FirstServiceStep
            onBack={handleBack}
            onNext={handleNext}
            onSkip={handleSkip}
            defaultValues={formData}
          />
        )}
        {currentStep === 5 && (
          <CompleteStep onBack={handleBack} formData={formData} />
        )}
      </div>
    </div>
  )
}
