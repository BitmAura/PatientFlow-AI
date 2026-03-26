import * as z from 'zod'

export const createPatientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dob: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  
  // Contact
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  
  // Medical
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  notes: z.string().optional(), // Medical notes
  
  // Emergency
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_relationship: z.string().optional(),
  
  // Preferences
  language: z.string().default('en'),
  whatsapp_opt_in: z.boolean().default(true),
  email_opt_in: z.boolean().default(true),
  
  // Flags
  is_vip: z.boolean().default(false),
  requires_deposit: z.boolean().default(false),
  is_blocked: z.boolean().default(false),
  block_reason: z.string().optional(),
  
  // Meta
  source: z.string().default('manual'),
  custom_fields: z.record(z.any()).optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  last_visit_from: z.date().optional(),
  last_visit_to: z.date().optional(),
  no_show_min: z.number().optional(),
  source: z.string().optional(),
  is_vip: z.boolean().optional(),
  requires_deposit: z.boolean().optional(),
  is_blocked: z.boolean().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sort_by: z.enum(['created_at', 'full_name', 'last_visit', 'total_visits']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Import Validations
export const importRowSchema = z.object({
  full_name: z.string({ required_error: 'Name is required' }),
  phone: z.string({ required_error: 'Phone is required' }),
  email: z.string().email().optional().or(z.literal('')),
  dob: z.union([z.date(), z.string()]).optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
  total_visits: z.number().optional(),
  no_shows: z.number().optional(),
  last_visit: z.union([z.date(), z.string()]).optional(),
  total_spent: z.number().optional(),
  source: z.string().optional(),
  tags: z.string().optional(), // Comma separated
})

export const importOptionsSchema = z.object({
  duplicate_handling: z.enum(['skip', 'update', 'create']).default('skip'),
  default_source: z.string().default('import'),
  tags: z.array(z.string()).default([]),
  requires_deposit: z.boolean().default(false),
})
