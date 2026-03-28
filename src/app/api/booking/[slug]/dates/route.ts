import { NextResponse } from 'next/server'
import { addDays, format, isWeekend } from 'date-fns'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function GET(
  request: Request,
  context: any
) {
  const ip = getClientIp(request)
  const limiter = checkRateLimit(`booking-dates:${ip}`, 120, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(limiter.remaining),
        },
      }
    )
  }

  // In a real app, we would:
  // 1. Fetch clinic business hours
  // 2. Check existing appointments count per day
  // 3. Return days that have at least one slot open

  // For MVP, simply return next 60 days excluding weekends (mock business logic)
  const dates = []
  const today = new Date()

  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i)
    // Assume open Mon-Sat (exclude Sunday = 0)
    if (date.getDay() !== 0) { 
      dates.push({
        date: format(date, 'yyyy-MM-dd'),
        status: 'available'
      })
    }
  }

  return NextResponse.json({ dates })
}

