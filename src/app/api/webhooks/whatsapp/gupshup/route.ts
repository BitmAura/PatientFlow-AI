import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED — This route is disabled.
 * Canonical Gupshup webhook: /api/webhooks/gupshup
 * That route enforces GUPSHUP_WEBHOOK_SECRET and handles STOP opt-outs correctly.
 * Configure Gupshup to deliver events to /api/webhooks/gupshup only.
 */
export async function POST(_request: NextRequest) {
  console.warn('[Deprecated] POST /api/webhooks/whatsapp/gupshup — use /api/webhooks/gupshup')
  return NextResponse.json({ received: true, deprecated: true })
}

export const GET = () => new NextResponse('Deprecated — use /api/webhooks/gupshup', { status: 410 })
