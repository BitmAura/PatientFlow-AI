import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.id) return new NextResponse('Subscription not found', { status: 404 })

  const { data: payments, error } = await supabase
    .from('subscription_payments')
    .select('id, amount, currency, status, paid_at, created_at, razorpay_payment_id')
    .eq('subscription_id', subscription.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Failed to fetch billing history', { status: 500 })
  }

  const invoices = (payments || []).map((payment: any) => ({
    id: payment.id,
    created_at: payment.paid_at || payment.created_at,
    description: `Subscription payment ${payment.razorpay_payment_id || payment.id}`,
    amount: Number(payment.amount || 0) / 100,
    status: payment.status === 'captured' ? 'paid' : payment.status,
    currency: payment.currency || 'INR',
  }))

  return NextResponse.json(invoices)
}
