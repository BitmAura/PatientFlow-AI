import { NextRequest, NextResponse } from 'next/server'
import { processScheduledReminders } from '@/lib/services/reminders'

export const dynamic = 'force-dynamic'

async function handler(request: NextRequest) {
  // Validate Vercel Cron Secret - REQUIRED, always enforce
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return new NextResponse('Service misconfigured', { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const stats = await processScheduledReminders()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    })
  } catch (error: any) {
    console.error('Cron job failed:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}

// Vercel Cron sends GET requests
export const GET = handler
// Allow manual POST triggers (e.g. from admin)
export const POST = handler
