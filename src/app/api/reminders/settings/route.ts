import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp/templates'
import { reminderSettingsSchema } from '@/lib/validations/reminder'

export async function GET() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  // Fetch settings from DB
  const { data: settings } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('clinic_id', staff.clinic_id)
    .single()

  if (!settings) {
    // Return defaults if no settings exist
    return NextResponse.json({
      booking_confirmation: { enabled: true, template: DEFAULT_TEMPLATES.booking_confirmation },
      reminder_24h: { enabled: true, template: DEFAULT_TEMPLATES.reminder_24h },
      reminder_2h: { enabled: true, template: DEFAULT_TEMPLATES.reminder_2h },
      no_show_followup: { enabled: false, template: DEFAULT_TEMPLATES.no_show_followup },
      post_visit_message: { enabled: false, template: DEFAULT_TEMPLATES.post_visit_message },
      language: 'en'
    })
  }

  return NextResponse.json(settings.config)
}

export async function PUT(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const body = await request.json()
  const result = reminderSettingsSchema.safeParse(body)

  if (!result.success) {
    return new NextResponse('Invalid settings format', { status: 400 })
  }

  // Upsert settings
  const { error } = await supabase
    .from('reminder_settings')
    .upsert({
      clinic_id: staff.clinic_id,
      config: result.data,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    }, { onConflict: 'clinic_id' })

  if (error) {
    console.error('Error saving settings:', error)
    return new NextResponse('Failed to save settings', { status: 500 })
  }

  return NextResponse.json({ success: true })
}
