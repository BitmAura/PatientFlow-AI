import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Update Clinic Bot Personality
 * 🚀 Activated by: CEO/Founder Persona
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { personality, botName } = await req.json()

    if (!personality) {
      return NextResponse.json({ error: 'Personality is required' }, { status: 400 })
    }

    // Get clinic ID for the user
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('clinics')
      .update({ 
        bot_personality: personality,
        bot_name: botName || 'Aura AI'
      })
      .eq('id', staff.clinic_id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Personality Update Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
