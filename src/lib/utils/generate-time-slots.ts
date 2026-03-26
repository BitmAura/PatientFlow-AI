import { format, addMinutes, parse, isBefore, isAfter, set, getDay } from 'date-fns'

interface TimeSlot {
  time: string
  available: boolean
}

interface GenerateTimeSlotsOptions {
  date: Date
  businessHours: { start: string; end: string } | null
  duration: number // Service duration
  appointments: { start_time: string; duration: number }[]
  blockedSlots?: { start_time: string; end_time: string }[]
  interval?: number // Slot interval (usually 30 mins or equal to service duration)
  doctorAvailability?: {
    use_clinic_hours: boolean
    custom_hours?: Record<string, { open: string; close: string; is_off: boolean }>
    blocked_dates?: string[]
  }
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function generateTimeSlots({
  date,
  businessHours,
  duration,
  appointments,
  blockedSlots = [],
  interval = 30,
  doctorAvailability
}: GenerateTimeSlotsOptions): TimeSlot[] {
  // 1. Determine Effective Business Hours
  let startStr: string | undefined
  let endStr: string | undefined
  let isDayOff = false

  if (doctorAvailability) {
    // Check blocked dates
    const dateStr = format(date, 'yyyy-MM-dd')
    if (doctorAvailability.blocked_dates?.includes(dateStr)) {
      return [] // Doctor blocked this entire day
    }

    if (!doctorAvailability.use_clinic_hours && doctorAvailability.custom_hours) {
      const dayName = DAYS[getDay(date)]
      const schedule = doctorAvailability.custom_hours[dayName]
      
      if (schedule) {
        if (schedule.is_off) {
          isDayOff = true
        } else {
          startStr = schedule.open
          endStr = schedule.close
        }
      } else {
        // No schedule defined for this day, assume off? Or default?
        // Let's assume default clinic hours if custom schedule is missing for a day? 
        // Or assume OFF if using custom hours and day not listed.
        // Safest: assume clinic hours if missing, or off.
        // Usually custom hours implies FULL override.
        isDayOff = false // Fallback to clinic hours if not defined?
      }
    }
  }

  // Fallback to clinic hours
  if ((!startStr || !endStr) && !isDayOff) {
    if (!businessHours) return [] // Clinic closed
    startStr = businessHours.start
    endStr = businessHours.end
  }

  if (isDayOff || !startStr || !endStr) return []

  const slots: TimeSlot[] = []
  
  // Parse hours
  const start = parse(startStr, 'HH:mm', date)
  const end = parse(endStr, 'HH:mm', date)
  
  let current = start
  
  while (isBefore(current, end)) {
    const slotEnd = addMinutes(current, duration)
    
    // Stop if slot exceeds business hours
    if (isAfter(slotEnd, end)) break
    
    // Check if slot overlaps with existing appointments
    const isOverlapAppt = appointments.some(appt => {
      const apptStart = new Date(appt.start_time)
      const apptEnd = addMinutes(apptStart, appt.duration)
      return isBefore(current, apptEnd) && isAfter(slotEnd, apptStart)
    })

    // Check if slot overlaps with blocked slots
    const isOverlapBlocked = blockedSlots.some(block => {
      const blockStart = new Date(block.start_time)
      const blockEnd = new Date(block.end_time)
      return isBefore(current, blockEnd) && isAfter(slotEnd, blockStart)
    })
    
    // Also check if slot is in the past (if today)
    const isPast = isBefore(current, new Date())

    slots.push({
      time: format(current, 'HH:mm'),
      available: !isOverlapAppt && !isOverlapBlocked && !isPast
    })
    
    // Move to next slot
    current = addMinutes(current, interval)
  }
  
  return slots
}
