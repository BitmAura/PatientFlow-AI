import { z } from "zod";

export const createDoctorSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  specialization: z.string().max(100).optional(),
  qualification: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  consultation_fee: z.coerce.number().min(0).default(0),
  photo_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  service_ids: z.array(z.string().uuid()).optional(),
  show_on_booking_page: z.boolean().default(true),
  is_active: z.boolean().default(true)
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

export const doctorAvailabilitySchema = z.object({
  use_clinic_hours: z.boolean().default(true),
  // custom_hours structure: { "monday": { "start": "09:00", "end": "17:00", "is_off": false } }
  custom_hours: z.record(z.any()).optional(),
  blocked_dates: z.array(z.string()).optional() // ISO date strings
});

export type DoctorAvailabilityInput = z.infer<typeof doctorAvailabilitySchema>;
