import { NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: any
) {
  const supabase = createClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, plan_id, billing_cycle')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.id) return new NextResponse('Subscription not found', { status: 404 })

  const { data: payment } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('id', context.params.id)
    .eq('subscription_id', subscription.id)
    .single()

  if (!payment) return new NextResponse('Invoice not found', { status: 404 })

  const doc = new jsPDF()

  const paidDate = payment.paid_at || payment.created_at
  const amountInr = Number(payment.amount || 0) / 100

  doc.setFontSize(16)
  doc.text('PatientFlow AI - Invoice', 14, 20)
  doc.setFontSize(10)
  doc.text(`Invoice ID: ${payment.id}`, 14, 28)
  doc.text(`Date: ${format(new Date(paidDate), 'dd MMM yyyy, hh:mm a')}`, 14, 34)
  doc.text(`Subscription: ${subscription.plan_id} (${subscription.billing_cycle})`, 14, 40)
  doc.text(`Payment ID: ${payment.razorpay_payment_id || '-'}`, 14, 46)
  doc.text(`Status: ${String(payment.status).toUpperCase()}`, 14, 52)

  doc.setFontSize(12)
  doc.text('Amount', 14, 66)
  doc.setFontSize(14)
  doc.text(`INR ${amountInr.toFixed(2)}`, 14, 74)

  doc.setFontSize(10)
  doc.text('Thank you for choosing PatientFlow AI.', 14, 88)
  
  const pdfBuffer = doc.output('arraybuffer')
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${context.params.id}.pdf"`
    }
  })
}

