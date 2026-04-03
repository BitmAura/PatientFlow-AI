'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MessageCircle,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Users,
  RefreshCw,
  Phone,
  Sparkles,
  Lock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/hooks/use-toast'

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type Step = 'enter_phone' | 'enter_otp' | 'success'

interface WhatsAppOtpWizardProps {
  /** Called when user successfully connects — pass back to parent so it can redirect or update state */
  onSuccess?: (phoneNumber: string) => void
  /** Called when user clicks "Skip for now" */
  onSkip?: () => void
  /** Pre-fill phone number (e.g. from clinic profile) */
  defaultPhone?: string
  /** Show a skip button */
  showSkip?: boolean
  /** Compact mode (no outer card padding for embedding inside onboarding) */
  compact?: boolean
}

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
export function WhatsAppOtpWizard({
  onSuccess,
  onSkip,
  defaultPhone = '',
  showSkip = false,
  compact = false,
}: WhatsAppOtpWizardProps) {
  const { toast } = useToast()

  const [step, setStep] = React.useState<Step>('enter_phone')
  const [phone, setPhone] = React.useState(defaultPhone.replace(/^\+91/, '').replace(/\D/g, ''))
  const [otp, setOtp] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(0)
  const [connectedPhone, setConnectedPhone] = React.useState('')

  const otpInputRef = React.useRef<HTMLInputElement>(null)

  /* countdown for resend */
  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  /* focus OTP field when step changes */
  React.useEffect(() => {
    if (step === 'enter_otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100)
    }
  }, [step])

  /* ── Step 1: send OTP ─────────────────────────────────────────── */
  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      toast({ title: 'Invalid number', description: 'Please enter a 10-digit mobile number.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/register-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: `+91${digits}` }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast({ title: 'Could not send OTP', description: data.error || 'Please try again.', variant: 'destructive' })
        return
      }

      setResendCooldown(30)
      setStep('enter_otp')
      toast({ title: 'OTP sent!', description: `Check WhatsApp on +91 ${digits}` })
    } catch {
      toast({ title: 'Network error', description: 'Check your internet and try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: verify OTP ───────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    const code = otp.replace(/\D/g, '')

    if (code.length < 4) {
      toast({ title: 'Enter OTP', description: 'Please enter the 6-digit code.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: `+91${digits}`, otp: code }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast({ title: 'Wrong OTP', description: data.error || 'The code is incorrect or expired.', variant: 'destructive' })
        return
      }

      const formattedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
      setConnectedPhone(formattedPhone)
      setStep('success')
      onSuccess?.(`+91${digits}`)
    } catch {
      toast({ title: 'Network error', description: 'Check your internet and try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Resend OTP ───────────────────────────────────────────────── */
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setOtp('')
    await handleSendOtp()
  }

  const wrapperCn = compact ? 'w-full' : 'mx-auto w-full max-w-lg'

  /* ══════════════════════════════════════════════════════════════
     STEP: Enter Phone
  ══════════════════════════════════════════════════════════════ */
  if (step === 'enter_phone') {
    return (
      <div className={wrapperCn}>
        {!compact && <StepHeader step={1} />}

        {/* Hero */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Connect WhatsApp in 2 minutes
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your <strong>clinic phone number</strong>. We'll send a one-time code to verify it.
          </p>
        </div>

        {/* Benefits row */}
        <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs">
          <BenefitPill icon={<Users className="h-3.5 w-3.5" />} label="75% fewer no-shows" />
          <BenefitPill icon={<Clock className="h-3.5 w-3.5" />} label="Save 2 hrs/day" />
          <BenefitPill icon={<Shield className="h-3.5 w-3.5" />} label="Official API" />
        </div>

        {/* Phone input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Clinic WhatsApp Number
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 dark:border-slate-600 dark:bg-slate-900">
            <div className="flex items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-base">🇮🇳</span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">+91</span>
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              className="flex-1 rounded-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            This number will be used to send reminders to your patients
          </p>
        </div>

        {/* Important note */}
        <Alert className="mt-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Use a dedicated clinic number</strong> — not your personal WhatsApp. Once connected,
            that number sends messages through our system (not your phone app).
          </AlertDescription>
        </Alert>

        {/* CTA */}
        <Button
          className="mt-5 w-full bg-green-600 text-white hover:bg-green-700"
          size="lg"
          onClick={handleSendOtp}
          disabled={loading || phone.length < 10}
        >
          {loading ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
          ) : (
            <><Smartphone className="mr-2 h-4 w-4" /> Send Verification Code</>
          )}
        </Button>

        {showSkip && (
          <button
            onClick={onSkip}
            className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            I'll set this up later →
          </button>
        )}
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     STEP: Enter OTP
  ══════════════════════════════════════════════════════════════ */
  if (step === 'enter_otp') {
    return (
      <div className={wrapperCn}>
        {!compact && <StepHeader step={2} />}

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Check your WhatsApp
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We sent a code to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              +91 {phone.slice(0, 5)} {phone.slice(5)}
            </span>
          </p>
        </div>

        {/* OTP boxes */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Enter the 6-digit code
          </label>
          <Input
            ref={otpInputRef}
            type="tel"
            inputMode="numeric"
            placeholder="• • • • • •"
            className="h-14 rounded-lg border-slate-300 text-center text-2xl font-bold tracking-[0.5em] shadow-sm focus:border-blue-500 focus:ring-blue-500/20"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Didn't receive it?</span>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={cn(
                'font-semibold transition-colors',
                resendCooldown > 0
                  ? 'cursor-default text-slate-400'
                  : 'text-blue-600 hover:text-blue-700'
              )}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>

        <Button
          className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-700"
          size="lg"
          onClick={handleVerifyOtp}
          disabled={loading || otp.length < 4}
        >
          {loading ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
          ) : (
            <><CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Activate WhatsApp</>
          )}
        </Button>

        <button
          onClick={() => { setStep('enter_phone'); setOtp('') }}
          className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600"
        >
          ← Change phone number
        </button>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     STEP: Success
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className={wrapperCn}>
      <div className="text-center">
        {/* Animated checkmark */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-60" style={{ animationDuration: '1.5s', animationIterationCount: 1 }} />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          WhatsApp Activated! 🎉
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{connectedPhone}</span>{' '}
          is now connected to PatientFlow AI.
        </p>
      </div>

      {/* What's now active */}
      <div className="mt-6 space-y-2">
        {[
          'Appointment confirmations sent automatically',
          '24-hour reminders before every appointment',
          'No-show recovery messages',
          'Patient recall & follow-up messages',
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-2.5 dark:border-green-900 dark:bg-green-950/40"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">{item}</span>
          </div>
        ))}
      </div>

      {/* Next step CTA */}
      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => onSuccess?.(connectedPhone)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Continue to Dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────── */
function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Enter number' },
    { n: 2, label: 'Verify OTP' },
    { n: 3, label: 'Done' },
  ]
  return (
    <div className="mb-6 flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                step >= s.n
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              )}
            >
              {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span className={cn('text-[10px] font-medium', step >= s.n ? 'text-green-700 dark:text-green-400' : 'text-slate-400')}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('mb-5 h-0.5 w-14 transition-colors', step > s.n ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700')} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function BenefitPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-green-50 px-2 py-2.5 dark:bg-green-950/40">
      <div className="text-green-600">{icon}</div>
      <span className="text-[10px] font-semibold text-green-800 dark:text-green-300">{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Standalone page card (used in settings)
───────────────────────────────────────────────────────────────── */
export function WhatsAppOtpCard(props: Omit<WhatsAppOtpWizardProps, 'compact'>) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <WhatsAppOtpWizard {...props} compact />
      </CardContent>
    </Card>
  )
}
