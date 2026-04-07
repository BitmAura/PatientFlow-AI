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
  const [payNow, setPayNow] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
    try {
      if (!payNow) {
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
        return
      }

      // Pay-now flow (guest, no login required)
      const createResp = await fetch('/api/guest/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone,
        }),
      })

      const createResult = await createResp.json()
      if (!createResp.ok || !createResult?.order) {
        setError(createResult?.error || 'Could not start payment. Please try again.')
        setState('error')
        return
      }

      const { order, keyId, leadId } = createResult

      // Load Razorpay Checkout script
      const loadScript = () =>
        new Promise<boolean>((resolve) => {
          if ((window as any).Razorpay) return resolve(true)
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })

      const ok = await loadScript()
      if (!ok) {
        setError('Could not load payment gateway. Please try again later.')
        setState('error')
        return
      }

      const encodedPhone = encodeURIComponent(payload.phone)

      const options: any = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'PatientFlow AI',
        description: 'Demo booking payment',
        order_id: order.id,
        prefill: {
          name: payload.name,
          contact: payload.phone,
        },
        notes: {
          leadId: leadId || null,
        },
        handler: async function (res: any) {
          try {
            await fetch('/api/guest/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                leadId,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_order_id: res.razorpay_order_id,
                razorpay_signature: res.razorpay_signature,
              }),
            })

            trackCta('Book Demo Pay', 'book_demo_pay', '/book-demo/thank-you')
            setState('success')
            event.currentTarget.reset()
            router.push(`/book-demo/thank-you?phone=${encodedPhone}`)
          } catch (err) {
            setError('Payment verification failed. Please contact support.')
            setState('error')
          }
        },
        modal: {
          ondismiss: function () {
            setState('idle')
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
      return
    } catch {
      setError('Network error. Please try again in a moment.')
      setState('error')
    }
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

        <div className="flex items-center gap-3">
          <input id="payNow" name="payNow" type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} />
          <label htmlFor="payNow" className="text-sm text-slate-700">Proceed to payment (pay now)</label>
        </div>

        <TwentyOneButton
          type="submit"
          className="w-full"
          disabled={state === 'loading'}
        >
          {state === 'loading' ? 'Submitting…' : payNow ? 'Pay & Book Demo' : 'Book My Free Demo'}
        </TwentyOneButton>
      </form>

      {state === 'error' && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  )
}
