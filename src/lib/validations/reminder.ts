import * as z from 'zod'

export const templateSchema = z.string().min(1, 'Template content cannot be empty').max(4096, 'Template is too long for WhatsApp')

export const reminderConfigSchema = z.object({
  enabled: z.boolean(),
  template: templateSchema,
})

export const reminderSettingsSchema = z.object({
  booking_confirmation: reminderConfigSchema,
  reminder_24h: reminderConfigSchema,
  reminder_2h: reminderConfigSchema,
  no_show_followup: reminderConfigSchema,
  post_visit_message: reminderConfigSchema,
  language: z.string().default('en'),
})

export type ReminderSettings = z.infer<typeof reminderSettingsSchema>
