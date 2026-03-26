'use client'

import * as React from 'react'
import { ClinicDetailsStep } from './onboarding-steps/clinic-details-step'
import { AddressStep } from './onboarding-steps/address-step'
import { CompleteStep } from './onboarding-steps/complete-step'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { id: 'details', title: 'Clinic Details' },
  { id: 'address', title: 'Address' },
  // { id: 'hours', title: 'Business Hours' }, // Placeholder for future steps
  // { id: 'services', title: 'Services' },
  // { id: 'whatsapp', title: 'Connect WhatsApp' },
  { id: 'complete', title: 'Complete' },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState({})

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{STEPS[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {currentStep === 0 && (
          <ClinicDetailsStep 
            onNext={handleNext} 
            defaultValues={formData} 
          />
        )}
        {currentStep === 1 && (
          <AddressStep 
            onBack={handleBack} 
            onNext={handleNext} 
            defaultValues={formData} 
          />
        )}
        {currentStep === 2 && (
          <CompleteStep
            onBack={handleBack}
            formData={formData}
          />
        )}
      </div>
    </div>
  )
}
