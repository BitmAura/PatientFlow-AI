import { createAdminClient } from '@/lib/supabase/admin'

export async function suggestUpcomingSlots(clinicId: string): Promise<string[]> {
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('appointments')
    .select('start_time')
    .eq('clinic_id', clinicId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3)

  if (!data || data.length === 0) {
    return ['Tomorrow 10:00 AM', 'Tomorrow 12:00 PM', 'Tomorrow 4:00 PM']
  }

  return data.map((row: { start_time: string }) => new Date(row.start_time).toLocaleString())
}

/**
 * TRIGGER: Automatic Waiting List Processing
 * Called when an appointment is cancelled via WhatsApp.
 * Finds the next patient in line and notifies them of the opening.
 */
export async function processWaitingList(clinicId: string): Promise<void> {
  const admin = createAdminClient() as any
  
  // 1. Get the next active patient in the waiting list (FIFO with priority)
  const { data: waitingEntry, error } = await admin
    .from('waiting_list')
    .select('*, patients(full_name, phone)')
    .eq('clinic_id', clinicId)
    .eq('status', 'active')
    .order('priority', { ascending: false }) // Urgent first
    .order('created_at', { ascending: true }) // Oldest first
    .limit(1)
    .single()

  if (error || !waitingEntry) return

  const patient = (waitingEntry as any).patients
  if (!patient || !patient.phone) return

  // 2. Trigger the WhatsApp Notification
  // Note: We use the existing WhatsApp service logic
  const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
  
  const message = `Hi ${patient.full_name}, a slot has just opened up at the clinic! Since you were on our waiting list, we wanted to offer it to you first. Reply YES if you want to book it now.`
  
  await sendWhatsAppMessage(clinicId, patient.phone, message, {
    type: 'waiting_list_alert'
  } as any)

  // 3. Mark as notified / pending
  await admin
    .from('waiting_list')
    .update({ status: 'notified', updated_at: new Date().toISOString() })
    .eq('id', waitingEntry.id)
}
