import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTimeSlots } from '@/lib/utils/generate-time-slots'
import { startOfDay, endOfDay, getDay } from 'date-fns'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const ip = getClientIp(request)
  const limiter = checkRateLimit(`booking-slots:${ip}`, 180, 60_000)
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

  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('service_id')
  const dateStr = searchParams.get('date')
  const doctorId = searchParams.get('doctor_id')

  if (!serviceId || !dateStr) {
    return new NextResponse('Missing params', { status: 400 })
  }

  const supabase = createClient()

  // 1. Fetch Clinic and Service in Parallel
  const [clinicResult, serviceResult] = await Promise.all([
    supabase
      .from('clinics')
      .select('id, business_hours, slot_duration')
      .eq('slug', params.slug)
      .single(),
    supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()
  ])

  const clinic = clinicResult.data
  const service = serviceResult.data

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })
  if (!service) return new NextResponse('Service not found', { status: 404 })

  const date = new Date(dateStr)
  const dayName = DAYS[getDay(date)]
  const dayStart = startOfDay(date).toISOString()
  const dayEnd = endOfDay(date).toISOString()

  // Helper to fetch appointments/blocked slots
  const fetchConflicts = async (dId?: string) => {
    let apptQuery = supabase
        .from('appointments')
        .select('start_time, end_time, duration')
        .eq('clinic_id', (clinic as any).id)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .neq('status', 'cancelled')
        .neq('status', 'no_show')

    let blockQuery = supabase
        .from('blocked_slots')
        .select('start_time, end_time')
        .eq('clinic_id', (clinic as any).id)
        .gte('start_time', dayStart)
        .lte('end_time', dayEnd)

    if (dId) {
      apptQuery = apptQuery.eq('doctor_id', dId)
      blockQuery = blockQuery.eq('doctor_id', dId)
    }

    const [apptResult, blockResult] = await Promise.all([
      apptQuery,
      blockQuery
    ])

    return {
      appointments: apptResult.data || [],
      blockedSlots: blockResult.data || []
    }
  }

  const { appointments, blockedSlots } = await fetchConflicts(doctorId || undefined)

  // 3. Get Doctor Availability (if specific doctor)
  let doctorAvailability = undefined
  if (doctorId) {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('availability')
      .eq('id', doctorId)
      .single()
    
    doctorAvailability = (doctor as any)?.availability
  }

  // 4. Generate Slots
  const businessHours = (clinic as any)?.business_hours?.[dayName] || null
  const slotDuration = (clinic as any)?.slot_duration || 30

  const slots = generateTimeSlots({
    date,
    businessHours,
    duration: (service as any).duration,
    appointments,
    blockedSlots,
    interval: slotDuration,
    doctorAvailability
  })

  return NextResponse.json(slots)
}