import { NextResponse } from 'next/server'

export async function POST() {
  return new NextResponse('QR flow not supported for WhatsApp Business API', { status: 410 })
}