import { NextResponse } from 'next/server'
import { addDays, differenceInMinutes, endOfDay, format, getDay, parse, startOfDay } from 'date-fns'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function normalizeHours(raw: any): { start: string; end: string } | null {
  if (!raw || typeof raw !== 'object') return null
  if (raw.is_off === true || raw.closed === true) return null

  const start = typeof raw.start === 'string' ? raw.start : typeof raw.open === 'string' ? raw.open : null
  const end = typeof raw.end === 'string' ? raw.end : typeof raw.close === 'string' ? raw.close : null
  if (!start || !end) return null

  return { start, end }
}

function estimateDailyCapacity(
  date: Date,
  hours: { start: string; end: string },
  slotIntervalMinutes: number,
  serviceDurationMinutes: number
): number {
  const start = parse(hours.start, 'HH:mm', date)
  const end = parse(hours.end, 'HH:mm', date)
  const availableMinutes = differenceInMinutes(end, start)

  if (!Number.isFinite(availableMinutes) || availableMinutes <= 0) return 0
  if (availableMinutes < serviceDurationMinutes) return 0

  return Math.max(0, Math.floor((availableMinutes - serviceDurationMinutes) / slotIntervalMinutes) + 1)
}

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

  const supabase = createClient() as any
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('service_id')

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, business_hours, slot_duration')
    .eq('slug', context.params.slug)
    .single()

  if (!clinic) {
    return new NextResponse('Clinic not found', { status: 404 })
  }

  let serviceDuration = Number(clinic.slot_duration || 30)
  if (serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .eq('clinic_id', clinic.id)
      .single()

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    serviceDuration = Number(service.duration || serviceDuration)
  }

  const slotInterval = Number(clinic.slot_duration || 30)
  const today = new Date()
  const rangeStart = startOfDay(today)
  const rangeEnd = endOfDay(addDays(today, 59))

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, status')
    .eq('clinic_id', clinic.id)
    .gte('start_time', rangeStart.toISOString())
    .lte('start_time', rangeEnd.toISOString())
    .neq('status', 'cancelled')
    .neq('status', 'no_show')

  const bookedByDate: Record<string, number> = {}
  for (const appointment of appointments || []) {
    const key = format(new Date(appointment.start_time), 'yyyy-MM-dd')
    bookedByDate[key] = (bookedByDate[key] || 0) + 1
  }

  const dates: Array<{
    date: string
    status: 'available' | 'limited' | 'full'
    remaining_slots: number
    capacity: number
  }> = []

  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i)
    const dayName = DAYS[getDay(date)]
    const hours = normalizeHours((clinic.business_hours || {})[dayName])
    if (!hours) continue

    const capacity = estimateDailyCapacity(date, hours, slotInterval, serviceDuration)
    if (capacity <= 0) continue

    const dateKey = format(date, 'yyyy-MM-dd')
    const booked = bookedByDate[dateKey] || 0
    const remaining = Math.max(0, capacity - booked)
    const threshold = Math.max(1, Math.ceil(capacity * 0.2))

    let status: 'available' | 'limited' | 'full' = 'available'
    if (remaining === 0) status = 'full'
    else if (remaining <= threshold) status = 'limited'

    dates.push({
      date: dateKey,
      status,
      remaining_slots: remaining,
      capacity,
    })
  }

  return NextResponse.json({ dates })
}

