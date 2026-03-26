'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OTPInput } from './otp-input'
import { useSendOTP, useVerifyOTP } from '@/hooks/use-portal-auth'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'
import { setUserLocale } from '@/lib/locale'

export function OTPLoginForm() {
  const t = useTranslations('Auth')
  const common = useTranslations('Common')
  
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
      toast({ title: t('otpSent'), description: t('otpSentDesc') })
    } catch (err) {
      toast({ variant: 'destructive', title: common('error'), description: 'Failed to send OTP.' })
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return
    try {
      await verifyOTP.mutateAsync({ phone, otp })
      toast({ title: 'Login Successful', description: 'Welcome back!' })
    } catch (err) {
      toast({ variant: 'destructive', title: common('error'), description: 'Invalid OTP.' })
    }
  }

  const toggleLanguage = async () => {
    // Simple toggle for MVP
    // In real app, check current locale
    const newLocale = document.cookie.includes('NEXT_LOCALE=hi') ? 'en' : 'hi'
    await setUserLocale(newLocale)
  }

  if (step === 'phone') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs">
            English / हिंदी
          </Button>
        </div>
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('phoneLabel')}</label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                +91
              </div>
              <Input 
                type="tel" 
                placeholder="9876543210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
            {sendOTP.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('getOtp')}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('enterOtpDesc', { phone })}
        </p>
        <button 
          onClick={() => setStep('phone')} 
          className="text-xs text-blue-600 hover:underline mt-1"
        >
          {t('changeNumber')}
        </button>
      </div>

      <OTPInput 
        value={otp} 
        onChange={setOtp} 
        onComplete={() => {}} 
      />

      <Button 
        onClick={handleVerifyOTP} 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={otp.length !== 6 || verifyOTP.isPending}
      >
        {verifyOTP.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('verifyLogin')}
      </Button>

      <div className="text-center">
        <button 
          onClick={(e) => handleSendOTP(e)} 
          className="text-sm text-gray-500 hover:text-gray-900"
          disabled={sendOTP.isPending}
        >
          {t('resendOtp')}
        </button>
      </div>
    </div>
  )
}
