import { z } from "zod";

export const createLeadSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  source: z.enum(['facebook_ad', 'google_ad', 'website', 'referral', 'manual']).default('manual'),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  interest: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
