import * as z from 'zod'

export const patientDetailsSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  whatsapp_consent: z.boolean().default(false),
  consentGiven: z.boolean().default(false),
})

export const confirmBookingSchema = z.object({
  clinic_id: z.string().uuid(),
  service_id: z.string().uuid(),
  doctor_id: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  patient: patientDetailsSchema,
  payment_id: z.string().optional()
})

export type PatientDetails = z.infer<typeof patientDetailsSchema>
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>
