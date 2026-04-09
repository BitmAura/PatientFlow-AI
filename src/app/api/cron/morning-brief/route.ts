import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateMorningBrief } from '@/services/automation/morning-brief-service'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient() as any
  
  try {
    // 1. Fetch all clinics with owners
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name, owner_phone')
      .not('owner_phone', 'is', null)

    if (clinicsError) throw clinicsError

    const results = []

    for (const clinic of clinics) {
      // 2. Generate Brief
      const { message, stats } = await generateMorningBrief(clinic.id)

      // 3. Send via WhatsApp to owner
      const response = await sendWhatsAppMessage(
        clinic.id,
        clinic.owner_phone,
        message,
        { type: 'morning_brief' } as any
      )

      // 4. Log to morning_briefs table
      await supabase.from('morning_briefs').insert({
        clinic_id: clinic.id,
        stats,
        status: response.success ? 'sent' : 'failed'
      })

      results.push({ clinicId: clinic.id, success: response.success })
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results
    })

  } catch (error: any) {
    console.error('[Morning Brief Cron] Global Failure:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
