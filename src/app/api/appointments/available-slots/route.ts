import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateTimeSlots } from '@/lib/utils/generate-time-slots'
import { startOfDay, endOfDay, getDay } from 'date-fns'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const doctorId = searchParams.get('doctor_id')

  if (!dateStr || !serviceId) {
    return new NextResponse('Date and Service ID are required', { status: 400 })
  }

  const date = new Date(dateStr)
  const dayName = DAYS[getDay(date)]
  const supabase = createClient()

  // 1. Get Clinic ID & Service Duration
  const { data: service } = await supabase
    .from('services')
    .select('duration, clinic_id')
    .eq('id', serviceId)
    .single()

  if (!service) return new NextResponse('Service not found', { status: 404 })

  // 2. Get Clinic Business Hours
  const { data: clinic } = await supabase
    .from('clinics')
    .select('business_hours, slot_duration')
    .eq('id', (service as any).clinic_id)
    .single()

  // 3. Get existing appointments
  const dayStart = startOfDay(date).toISOString()
  const dayEnd = endOfDay(date).toISOString()

  const existingQuery = supabase
    .from('appointments')
    .select('start_time, duration')
    .eq('service_id', serviceId)
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd)
    .in('status', ['confirmed', 'checked_in'])

  if (doctorId) {
    existingQuery.eq('doctor_id', doctorId)
  }

  const { data: existing } = await existingQuery

  // 4. Generate available slots using the correct function signature
  const businessHours = (clinic as any)?.business_hours?.[dayName] || null
  const slotDuration = (clinic as any)?.slot_duration || 30

  const slots = generateTimeSlots({
    date,
    businessHours,
    duration: (service as any).duration,
    appointments: existing || [],
    interval: slotDuration
  })

  return NextResponse.json(slots)
}