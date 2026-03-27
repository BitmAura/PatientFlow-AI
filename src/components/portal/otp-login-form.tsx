'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OTPInput } from './otp-input'
import { useSendOTP, useVerifyOTP } from '@/hooks/use-portal-auth'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function OTPLoginForm() {
  const [step, setStep] = React.useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = React.useState('')
  const [otp, setOtp] = React.useState('')

  const sendOTP = useSendOTP()
  const verifyOTP = useVerifyOTP()
  const { toast } = useToast()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 10) return

    try {
      await sendOTP.mutateAsync(phone)
      setStep('otp')
      toast({ title: 'OTP sent', description: 'Check your WhatsApp for the code.' })
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send OTP.' })
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return
    try {
      await verifyOTP.mutateAsync({ phone, otp })
      toast({ title: 'Login Successful', description: 'Welcome back!' })
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid OTP.' })
    }
  }

  if (step === 'phone') {
    return (
      <div className="space-y-4">
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone number</label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center rounded-md border bg-gray-50 px-3 text-sm text-gray-500">
                +91
              </div>
              <Input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1"
                maxLength={10}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={phone.length < 10 || sendOTP.isPending}
          >
            {sendOTP.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get OTP'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Enter the code sent to +91 {phone}
        </p>
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="mt-1 text-xs text-blue-600 hover:underline"
        >
          Change number
        </button>
      </div>

      <OTPInput value={otp} onChange={setOtp} onComplete={() => {}} />

      <Button
        type="button"
        onClick={handleVerifyOTP}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={otp.length !== 6 || verifyOTP.isPending}
      >
        {verifyOTP.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Login'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={e => handleSendOTP(e)}
          className="text-sm text-gray-500 hover:text-gray-900"
          disabled={sendOTP.isPending}
        >
          Resend OTP
        </button>
      </div>
    </div>
  )
}
