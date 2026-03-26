'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function DemoBookingForm() {
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('loading')
    setError('')
    setCalendarUrl(null)

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get('name') || ''),
      clinicName: String(formData.get('clinicName') || ''),
      phone: String(formData.get('phone') || ''),
      city: String(formData.get('city') || ''),
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

      setCalendarUrl(result?.calendarUrl || null)
      setState('success')
      event.currentTarget.reset()
    } catch {
      setError('Network error. Please try again in a moment.')
      setState('error')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Book Your Free Demo</h2>
      <p className="mt-2 text-sm text-slate-600">
        Submit your details and we will send a WhatsApp confirmation instantly.
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
            Phone
          </label>
          <Input id="phone" name="phone" placeholder="e.g. 9876543210" required />
        </div>

        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
            City
          </label>
          <Input id="city" name="city" placeholder="Your city" required />
        </div>

        <Button type="submit" className="w-full" disabled={state === 'loading'}>
          {state === 'loading' ? 'Submitting...' : 'Book Demo'}
        </Button>
      </form>

      {state === 'success' && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Demo booked successfully. We have sent your WhatsApp message.
          {calendarUrl && (
            <div className="mt-2">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Optional: choose a calendar slot
              </a>
            </div>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  )
}
