import { createClient } from '@/lib/supabase/server'
import { CreateFollowupInput } from '@/lib/validations/followup'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { buildMessage } from '@/lib/whatsapp/templates'
import { FOLLOWUP_TYPES } from '@/constants/followup-types'
import { addDays } from 'date-fns'

export async function createFollowup(data: CreateFollowupInput & { clinic_id: string, created_by: string }) {
  const supabase = createClient() as any
  
  const { data: followup, error } = await supabase
    .from('followups')
    .insert({
      ...data,
      status: 'pending',
      due_date: new Date(data.due_date).toISOString()
    })
    .select()
    .single()

  if (error) throw new Error('Failed to create followup')
  return followup
}

export async function sendFollowup(followupId: string) {
  const supabase = createClient() as any
  
  // 1. Get followup with patient details
  const { data: followup } = await supabase
    .from('followups')
    .select('*, patient:patients(*), clinic:clinics(*)')
    .eq('id', followupId)
    .single()

  if (!followup) throw new Error('Followup not found')

  // 2. Build message
  // Assuming message in DB is the template or final message
  // If template, we parse. For simplicity, let's assume it's pre-filled but might need variable replacement
  const message = buildMessage(followup.message, {
    patient_name: followup.patient.full_name,
    patient_first_name: followup.patient.first_name || followup.patient.full_name.split(' ')[0],
    clinic_name: followup.clinic?.name || 'Clinic',
    service: 'Appointment', // Placeholder if not linked
    booking_link: `https://app.aura.me/book/${followup.clinic_id}`
  })

  // 3. Send
  const result = await sendWhatsAppMessage(
    followup.clinic_id,
    followup.patient.phone,
    message,
    {
      type: 'followup',
      followupId: followup.id,
      patientId: followup.patient_id
    }
  )

  if (result.success) {
    await supabase
      .from('followups')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', followupId)
  }

  return result
}

export async function convertToAppointment(
  followupId: string,
  appointmentData: { service_type: string, start_time: string, clinic_id: string, created_by: string }
) {
  const supabase = createClient() as any
  
  // 1. Get followup for patient_id
  const { data: followup } = await supabase
    .from('followups')
    .select('patient_id')
    .eq('id', followupId)
    .single()

  if (!followup) throw new Error('Followup not found')

  // 2. Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: followup.patient_id,
      clinic_id: appointmentData.clinic_id,
      service_type: appointmentData.service_type,
      start_time: appointmentData.start_time,
      status: 'confirmed', // Assuming direct booking
      created_by: appointmentData.created_by
    })
    .select()
    .single()

  if (error) throw new Error('Failed to create appointment')

  // 3. Update followup
  await supabase
    .from('followups')
    .update({ 
      status: 'converted',
      converted_appointment_id: appointment.id
    })
    .eq('id', followupId)

  return appointment
}

export async function autoCreateFollowup(
  appointmentId: string,
  type: string
) {
  const supabase = createClient() as any
  
  // Get appointment details
  const { data: appt } = await supabase
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('id', appointmentId)
    .single()

  if (!appt) return

  const typeConfig = FOLLOWUP_TYPES.find(t => t.id === type)
  if (!typeConfig) return

  const dueDate = addDays(new Date(appt.start_time), typeConfig.defaultDays)
  
  // Build default message
  const message = typeConfig.defaultTemplate // Placeholder, real impl would parse variables here or store template

  await createFollowup({
    patient_id: appt.patient_id,
    clinic_id: appt.clinic_id,
    created_by: 'system', // System user or similar
    type: type as any,
    due_date: dueDate,
    appointment_id: appt.id,
    message
  })
}

export async function processDueFollowups() {
  const supabase = createClient() as any
  const today = new Date().toISOString().split('T')[0]
  
  // Find due followups
  // In real app, check for 'auto_send' flag on followup or settings
  // For MVP, we might only send if explicitly marked for auto-send (which we haven't built yet)
  // So we'll skip auto-sending for now to be safe, or only send specific types
  
  return { processed: 0, sent: 0, skipped: 0 }
}
