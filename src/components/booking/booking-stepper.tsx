import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BookingStepperProps {
  currentStep: number
  hasPayment?: boolean
  showDoctorStep?: boolean
}

export function BookingStepper({ currentStep, hasPayment = false, showDoctorStep = false }: BookingStepperProps) {
  const steps = React.useMemo(() => {
    const base = ['Service']
    if (showDoctorStep) base.push('Doctor')
    base.push('Date', 'Time', 'Details')
    if (hasPayment) base.push('Payment')
    base.push('Done')
    return base
  }, [hasPayment, showDoctorStep])

  return (
    <div className="w-full py-4 px-6 bg-white border-b sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* Progress Bar Background */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-10" />
        
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          
          return (
            <div key={step} className="flex flex-col items-center relative bg-white px-1">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors border-2",
                  isCompleted ? "bg-green-500 border-green-500 text-white" :
                  isCurrent ? "bg-primary border-primary text-white" :
                  "bg-white border-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium hidden sm:block",
                isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
