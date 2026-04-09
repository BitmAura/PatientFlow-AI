import { createAdminClient } from '@/lib/supabase/admin'

/**
 * PatientFlow AI Risk Engine
 * Calculates a score 0-100 indicating the probability of a no-show.
 */
export async function calculateNoShowRisk(appointmentId: string): Promise<number> {
  const supabase = createAdminClient() as any
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      id,
      created_at,
      start_time,
      status,
      patient_id,
      clinic_id,
      patient:patients (
        id,
        phone,
        reschedule_count
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) return 0

  let score = 0

  // 1. Patient has no-showed before: +40
  const { count: prevNoShows } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', appointment.patient_id)
    .eq('status', 'no_show')

  if (prevNoShows && prevNoShows > 0) score += 40

  // 2. Appointment booked more than 7 days ago: +15
  const bookedAt = new Date(appointment.created_at)
  const startTime = new Date(appointment.start_time)
  const daysDiff = (startTime.getTime() - bookedAt.getTime()) / (1000 * 3600 * 24)
  if (daysDiff > 7) score += 15

  // 3. Status flags
  // Patient has not confirmed via WhatsApp: +20
  // Patient confirmed via WhatsApp: -30
  if (appointment.status === 'confirmed') {
    score -= 30
  } else if (appointment.status === 'scheduled') {
    score += 20
  }

  // 4. Patient is new (first appointment): +10
  const { count: totalAppts } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', appointment.patient_id)
  
  if (totalAppts === 1) score += 10

  // 5. Monday or Friday: +5
  const day = startTime.getDay() // 0 = Sunday, 1 = Monday, 5 = Friday
  if (day === 1 || day === 5) score += 5

  // 6. Rescheduled twice before: +20
  if ((appointment.patient?.reschedule_count || 0) >= 2) {
    score += 20
  }

  // Clamp score
  const finalScore = Math.max(0, Math.min(100, score))
  
  // Update appointment with new score
  await supabase
    .from('appointments')
    .update({ no_show_risk_score: finalScore })
    .eq('id', appointmentId)

  return finalScore
}

export function getRiskLabel(score: number): { label: string; color: string } {
  if (score <= 30) return { label: 'Low Risk', color: 'green' }
  if (score <= 60) return { label: 'Medium Risk', color: 'yellow' }
  return { label: 'High Risk', color: 'red' }
}
