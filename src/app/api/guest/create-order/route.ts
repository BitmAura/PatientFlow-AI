import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaymentOrder } from '@/services/payment'

interface CreateOrderPayload {
  name?: string
  phone?: string
  amount?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderPayload
    const name = (body.name || '').trim()
    const phone = (body.phone || '').trim()

    // Try to create a lead with admin client; if not available, continue without persisting
    let leadId: string | null = null
    const clinicId = process.env.DEMO_BOOKING_CLINIC_ID || null

    try {
      const supabase = createAdminClient() as any
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          clinic_id: clinicId,
          full_name: name || 'Guest',
          phone,
          source: 'website',
          status: 'payment_pending',
          interest: 'demo_booking',
          notes: `Pay flow initiated`,
          followup_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (lead && lead.id) leadId = lead.id
    } catch (err) {
      // Missing service role key or DB error; we still allow payment to proceed
      console.warn('[guest/create-order] could not create lead:', err)
      leadId = null
    }

    const feeInr = parseInt(process.env.DEMO_BOOKING_FEE_INR || '2999', 10)
    const amountInr = body.amount ? Number(body.amount) : feeInr
    const receipt = leadId ? `lead_${leadId}` : `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`

    const order = await createPaymentOrder({
      amount: amountInr,
      receipt,
      description: 'Demo booking payment',
      notes: {
        ...(leadId ? { leadId } : {}),
        ...(clinicId ? { clinicId } : {}),
        name,
        phone,
      },
    })

    // Only expose the public (NEXT_PUBLIC_) Razorpay key to clients.
    // Do NOT return server-side secrets (RAZORPAY_KEY_SECRET / RAZORPAY_KEY_ID).
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null

    return NextResponse.json({ success: true, order, keyId, leadId })
  } catch (err) {
    console.error('[guest/create-order] error', err)
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 })
  }
}
