import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PatientDetails } from '@/lib/validations/booking'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface PatientDetailsFormProps {
  data: PatientDetails
  onChange: (data: PatientDetails) => void
}

export function PatientDetailsForm({ data, onChange }: PatientDetailsFormProps) {
  const handleChange = (field: keyof PatientDetails, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="John Doe"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
        <div className="flex overflow-hidden rounded-lg border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="flex items-center gap-1 border-r bg-muted px-3">
            <span>🇮🇳</span>
            <span className="text-sm font-semibold text-muted-foreground">+91</span>
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
            className="rounded-none border-0 shadow-none focus-visible:ring-0"
            placeholder="9876543210"
            maxLength={10}
          />
        </div>
        <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-lg border border-primary/10 mt-2 hover:bg-primary/10 transition-colors cursor-pointer group">
          <Checkbox 
            id="whatsapp_consent" 
            checked={Boolean((data as any).whatsapp_consent)}
            onCheckedChange={(v) => handleChange('whatsapp_consent' as any, Boolean(v))}
          />
          <Label htmlFor="whatsapp_consent" className="text-xs font-semibold text-primary cursor-pointer select-none">
            Send my appointment details & reminders via WhatsApp
          </Label>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-muted-foreground font-normal text-xs">(Optional — for email reminders)</span></Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes for the doctor <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any symptoms, previous history, or specific questions..."
          rows={3}
        />
      </div>

      {/* DISHA Consent — required */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={Boolean((data as any).consentGiven)}
            onCheckedChange={(v) => handleChange('consentGiven' as keyof PatientDetails, Boolean(v))}
            className="mt-0.5"
          />
          <div className="space-y-1.5">
            <Label htmlFor="consent" className="text-sm font-medium cursor-pointer leading-relaxed">
              I consent to the clinic collecting and using my health information to manage my appointment and send reminders.
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your data is protected under{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">India&apos;s DISHA guidelines</span>.
              The clinic will only use it for scheduling and care purposes.
              You can request deletion at any time by contacting the clinic.{' '}
              <Link href="/privacy" className="underline hover:text-foreground" target="_blank">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
        <span>Your data is encrypted and never sold to third parties.</span>
      </div>
    </div>
  )
}
