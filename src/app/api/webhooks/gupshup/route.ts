import { NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/messages/handler'
import { receiveWebhook, verifyWebhookSignature } from '@/services/messaging'

export async function POST(request: Request) {
  if (!verifyWebhookSignature({ provider: 'gupshup', request })) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const result = await receiveWebhook({ provider: 'gupshup', payload })

    const clinicIds = result.resolvedClinicIds
    for (let i = 0; i < result.messages.length; i += 1) {
      const message = result.messages[i]
      const clinicId = clinicIds[i]
      if (!clinicId) continue
      await handleIncomingMessage({
        clinicId,
        fromPhone: message.from,
        content: message.content,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

