import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  duration_minutes: z.coerce.number().min(15).max(480),
  price: z.coerce.number().min(0).optional(),
  deposit_required: z.boolean().default(false),
  deposit_amount: z.coerce.number().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  is_active: z.boolean().default(true)
})

export type CreateServiceValues = z.infer<typeof createServiceSchema>
