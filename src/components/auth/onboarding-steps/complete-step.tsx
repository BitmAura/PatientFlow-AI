'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Calendar, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CompleteStepProps {
  onBack: () => void
  formData?: Record<string, unknown>
}

export function CompleteStep({ onBack, formData = {} }: CompleteStepProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic: formData.name !== undefined ? { name: formData.name, description: formData.description, phone: formData.phone, email: formData.email, website: formData.website } : undefined,
          address: formData.addressLine1 !== undefined ? { addressLine1: formData.addressLine1, addressLine2: formData.addressLine2, city: formData.city, state: formData.state, postalCode: formData.postalCode, country: formData.country } : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to complete setup')
        setLoading(false)
        return
      }
      toast.success('Clinic created. Taking you to the dashboard.')
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">
          All Set! Your Clinic is Ready.
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You have successfully set up your profile. You can now start managing appointments and reducing no-shows.
        </p>
      </div>

      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4 text-left">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-semibold">Start Booking</h4>
          <p className="text-xs text-muted-foreground">Add your first appointment</p>
        </div>
        {/* Add more summary cards if needed */}
      </div>

      <div className="flex w-full max-w-md justify-between pt-8">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleComplete} disabled={loading} className="w-full sm:w-auto ml-4">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
