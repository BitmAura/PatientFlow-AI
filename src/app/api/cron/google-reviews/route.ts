import { NextRequest, NextResponse } from 'next/server'
import { processGoogleReviewNudges } from '@/services/automation/google-review-service'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { processed } = await processGoogleReviewNudges()

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Google Review Cron] Failure:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
