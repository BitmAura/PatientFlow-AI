import { NextResponse } from 'next/server'
import { processScheduledReminders } from '@/lib/services/reminders'

export async function POST(request: Request) {
  // Validate Vercel Cron Secret
  // In production, this prevents unauthorized triggering of the cron job
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const stats = await processScheduledReminders()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats
    })
  } catch (error: any) {
    console.error('Cron job failed:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}
