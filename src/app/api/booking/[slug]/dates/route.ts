import { NextResponse } from 'next/server'
import { addDays, format, isWeekend } from 'date-fns'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
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
