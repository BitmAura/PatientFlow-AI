'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { WhatsAppOtpWizard } from '@/components/whatsapp/whatsapp-otp-wizard'
import { ArrowRight, MessageCircle } from 'lucide-react'

interface WhatsAppStepProps {
  onNext: (data: { whatsappConnected: boolean; whatsappPhone?: string }) => void
  onBack: () => void
  defaultValues?: Record<string, unknown>
}

export function WhatsAppStep({ onNext, onBack, defaultValues }: WhatsAppStepProps) {
  const clinicPhone = typeof defaultValues?.phone === 'string' ? defaultValues.phone : ''

  const handleSuccess = (phone: string) => {
    onNext({ whatsappConnected: true, whatsappPhone: phone })
  }

  const handleSkip = () => {
    onNext({ whatsappConnected: false })
  }

  return (
    <div className="space-y-4">
      {/* Context banner */}
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/40">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
            This is the most important step
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            Your clinic can only send reminders &amp; reduce no-shows once WhatsApp is connected.
            Takes 2 minutes.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <WhatsAppOtpWizard
        compact
        defaultPhone={clinicPhone}
        showSkip
        onSuccess={handleSuccess}
        onSkip={handleSkip}
      />

      {/* Back link */}
      <div className="pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-slate-400">
          ← Back to Address
        </Button>
      </div>
    </div>
  )
}
