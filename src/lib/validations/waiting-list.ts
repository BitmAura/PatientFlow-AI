import { z } from "zod";

export const addToWaitlistSchema = z.object({
  patient_id: z.string().uuid("Patient ID is required"),
  service_id: z.string().uuid("Service ID is required"),
  preferred_date_from: z.string().min(1, "Start date is required"),
  preferred_date_to: z.string().min(1, "End date is required"),
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
  preferred_days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().max(500).optional(),
});

export type AddToWaitlistInput = z.infer<typeof addToWaitlistSchema>;

export const notifyPatientSchema = z.object({
  available_date: z.string(),
  available_time: z.string(),
});

export const convertToAppointmentSchema = z.object({
  date: z.string(),
  time: z.string(),
});
