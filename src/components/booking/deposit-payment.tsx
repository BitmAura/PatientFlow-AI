'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { useToast } from "@/hooks/use-toast"

export interface DepositPaymentResult {
  payment_id: string
  order_id: string
  signature: string
}

interface DepositPaymentProps {
  amount: number
  clinicId: string
  serviceId: string
  serviceName: string
  clinicName: string
  patient: {
    name: string
    email?: string
    phone: string
  }
  onSuccess: (result: DepositPaymentResult) => void
  onCancel: () => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function DepositPayment({
  amount,
  clinicId,
  serviceId,
  serviceName,
  clinicName,
  patient,
  onSuccess,
  onCancel
}: DepositPaymentProps) {
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. Create Order
      const res = await fetch('/api/booking/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          clinic_id: clinicId,
          service_id: serviceId,
          patient_name: patient.name,
          patient_email: patient.email || '',
          patient_phone: patient.phone,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error || 'Unable to create payment order')
      }
      const order = await res.json()

      // 2. Open Razorpay checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: clinicName,
        description: `Deposit for ${serviceName}`,
        order_id: order.order_id,
        handler: function (response: any) {
          onSuccess({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })
        },
        prefill: {
          name: patient.name,
          email: patient.email,
          contact: patient.phone,
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            toast({ variant: 'default', title: 'Payment Cancelled' })
          }
        }
      }

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Razorpay SDK not loaded in development. Simulating success.')
          setTimeout(() => {
            onSuccess({
              payment_id: 'mock_pay_' + Math.random().toString(36).substring(7),
              order_id: order.order_id || 'mock_order',
              signature: 'mock_sig',
            })
            setLoading(false)
          }, 1500)
          return
        }

        throw new Error('Payment gateway unavailable. Please try again.')
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Payment Error', description: 'Could not initialize payment.' })
      setLoading(false)
    }
  }

  // Load script effect
  React.useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Secure Deposit Payment</h2>
        <p className="text-gray-500">
          A deposit of {formatCurrency(amount)} is required to confirm your appointment.
        </p>
      </div>

      <Card className="max-w-md mx-auto border-blue-100 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between">
            <span>{serviceName}</span>
            <span>{formatCurrency(amount)}</span>
          </CardTitle>
          <CardDescription>
            Payable to {clinicName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-blue-200">
              <span>Total Due</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]" 
            size="lg" 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {loading ? 'Processing...' : `Pay ${formatCurrency(amount)} Now`}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel} disabled={loading}>
            Back
          </Button>
          <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secured by Razorpay
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
