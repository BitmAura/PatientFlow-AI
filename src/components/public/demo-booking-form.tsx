'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { useTrackCta } from '@/hooks/use-track-cta'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

interface DemoBookingFormProps {
  isConfigured: boolean
}

export function DemoBookingForm({ isConfigured }: DemoBookingFormProps) {
  const router = useRouter()
  const trackCta = useTrackCta()
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isConfigured) {
      setState('error')
      setError('Demo booking is temporarily unavailable. Please contact support.')
      return
    }

    setState('loading')
    setError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get('name') || ''),
      clinicName: String(formData.get('clinicName') || ''),
      phone: String(formData.get('phone') || ''),
      monthlyAppointments: String(formData.get('monthlyAppointments') || ''),
    }

    try {
      const response = await fetch('/api/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Could not submit your booking. Please try again.')
        setState('error')
        return
      }

      trackCta('Book Demo Submit', 'book_demo_form', '/book-demo/thank-you')
      setState('success')
      event.currentTarget.reset()
      const encodedPhone = encodeURIComponent(payload.phone)
      router.push(`/book-demo/thank-you?phone=${encodedPhone}`)
    } catch {
      setError('Network error. Please try again in a moment.')
      setState('error')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Book Your 15-Min Demo</h2>
      <p className="mt-2 text-sm text-slate-600">
        Submit your details and we will send WhatsApp confirmation instantly.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <Input id="name" name="name" placeholder="Your full name" required />
        </div>

        <div>
          <label htmlFor="clinicName" className="mb-1 block text-sm font-medium text-slate-700">
            Clinic Name
          </label>
          <Input id="clinicName" name="clinicName" placeholder="Your clinic name" required />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Phone Number (WhatsApp)
          </label>
          <Input id="phone" name="phone" placeholder="e.g. +91 98765 43210" required />
        </div>

        <div>
          <label htmlFor="monthlyAppointments" className="mb-1 block text-sm font-medium text-slate-700">
            Monthly appointments
          </label>
          <select
            id="monthlyAppointments"
            name="monthlyAppointments"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            defaultValue=""
          >
            <option value="" disabled>
              Select monthly volume
            </option>
            <option value="50-100">50-100</option>
            <option value="100-200">100-200</option>
            <option value="200-500">200-500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <TwentyOneButton
          type="submit"
          className="w-full"
          disabled={state === 'loading' || !isConfigured}
        >
          {state === 'loading' ? 'Submitting...' : 'Book Demo'}
        </TwentyOneButton>
      </form>

      {!isConfigured && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Demo booking is temporarily unavailable. Please contact us at support@auradigitalservices.me.
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  )
}
