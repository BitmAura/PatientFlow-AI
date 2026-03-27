import { NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/messages/handler'
import { receiveWebhook } from '@/services/messaging'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const result = await receiveWebhook({ provider: 'meta', payload })

    for (let i = 0; i < result.messages.length; i += 1) {
      const message = result.messages[i]
      const clinicId = result.resolvedClinicIds[i]
      if (!clinicId) continue
      await handleIncomingMessage({
        clinicId,
        fromPhone: message.from,
        content: message.content,
      })
    }
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
  }

  return NextResponse.json({ received: true })
}
