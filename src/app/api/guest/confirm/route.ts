import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaymentSignature, getPaymentDetails } from '@/services/payment'

interface ConfirmPayload {
  leadId?: string | null
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmPayload

    const { leadId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

    const verification = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!verification || !verification.verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // fetch payment details (optional, helpful for records)
    let payment: any = null
    try {
      payment = await getPaymentDetails(razorpay_payment_id)
    } catch (err) {
      console.warn('[guest/confirm] could not fetch payment details', err)
    }

    // Update lead if we have a leadId and admin client
    if (leadId) {
      try {
        const supabase = createAdminClient() as any
        await supabase
          .from('leads')
          .update({
            status: 'paid',
            notes: `Payment received: ${razorpay_payment_id} (order ${razorpay_order_id})`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', leadId)
      } catch (err) {
        console.warn('[guest/confirm] could not update lead', err)
      }
    }

    return NextResponse.json({ success: true, verified: true, payment })
  } catch (err) {
    console.error('[guest/confirm] error', err)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 })
  }
}
