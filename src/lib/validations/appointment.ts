import * as z from 'zod'
import { AppointmentStatus } from '@/constants/appointment-status'

export const createAppointmentSchema = z.object({
  patient_id: z.string().uuid({ message: 'Patient is required' }),
  service_id: z.string().uuid({ message: 'Service is required' }),
  doctor_id: z.string().uuid({ message: 'Doctor is required' }).optional(),
  scheduled_date: z.date({ required_error: 'Date is required' }),
  scheduled_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  send_confirmation: z.boolean().default(true),
  deposit_override: z.boolean().default(false),
})

export const updateAppointmentSchema = createAppointmentSchema.partial()

export const rescheduleSchema = z.object({
  new_date: z.date({ required_error: 'New date is required' }),
  new_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  reason: z.string().optional(),
})

export const cancelSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  cancelled_by: z.enum(['patient', 'clinic']),
  refund_deposit: z.boolean().default(false),
  send_notification: z.boolean().default(true),
})

export const statusUpdateSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  reason: z.string().optional(),
})

export const appointmentFiltersSchema = z.object({
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  status: z.array(z.nativeEnum(AppointmentStatus)).optional(),
  service_id: z.array(z.string()).optional(),
  doctor_id: z.array(z.string()).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
