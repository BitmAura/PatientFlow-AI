import * as z from 'zod'

export const audienceFilterSchema = z.object({
  months_since_visit: z.string().optional(), // Using string for select value
  min_no_shows: z.number().optional(),
  birthday_range: z.enum(['today', 'this_week', 'this_month']).optional(),
  exclude_opted_out: z.boolean().default(true),
  exclude_with_upcoming: z.boolean().optional(),
  custom_conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any()
  })).optional()
})

export type AudienceFilters = z.infer<typeof audienceFilterSchema>

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['checkup_reminder', 'no_show_reengagement', 'birthday_wishes', 'special_offer', 'new_service', 'festival_greetings', 'custom']),
  audience_filter: audienceFilterSchema,
  message: z.string().min(10, 'Message is too short').max(4096, 'Message exceeds limit'),
  scheduled_at: z.string().optional(), // ISO string
  send_immediately: z.boolean().default(false)
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
