import * as z from 'zod'

export const createFollowupSchema = z.object({
  patient_id: z.string().uuid(),
  type: z.enum(['post_treatment', 'routine_checkup', 'medication_reminder', 'test_results', 'pending_booking', 'custom']),
  due_date: z.string().or(z.date()),
  appointment_id: z.string().uuid().optional(),
  message: z.string().min(10).max(1000)
})

export type CreateFollowupInput = z.infer<typeof createFollowupSchema>

export const convertFollowupSchema = z.object({
  service_type: z.string().min(1, 'Service is required'),
  start_time: z.string() // ISO string
})
