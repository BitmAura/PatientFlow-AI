'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface OnboardingData {
  clinicName: string
  doctorName: string
  specialization: string
  treatments: { name: string; price: number }[]
  botPersonality: string
}

export async function completeOnboarding(userId: string, data: OnboardingData) {
  const supabase = createAdminClient() as any

  try {
    // 1. Create Clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: data.clinicName,
        status: 'active',
        use_shared_number: true, // Start with shared number
        bot_personality: data.botPersonality
      })
      .select('id')
      .single()

    if (clinicError || !clinic) throw new Error(clinicError?.message || 'Failed to create clinic')

    // 2. Create First Doctor (Owner)
    const { data: doctor, error: docError } = await supabase
      .from('doctors')
      .insert({
        clinic_id: clinic.id,
        name: data.doctorName,
        specialization: data.specialization
      })
      .select('id')
      .single()

    if (docError) throw new Error(docError.message)

    // 3. Link Staff Profile
    const { error: staffError } = await supabase
      .from('staff')
      .upsert({
        user_id: userId,
        clinic_id: clinic.id,
        full_name: data.doctorName,
        role: 'owner',
        doctor_id: doctor.id
      })

    if (staffError) throw new Error(staffError.message)

    // 4. Seed Default Treatments
    if (data.treatments.length > 0) {
      const treatmentData = data.treatments.map(t => ({
        clinic_id: clinic.id,
        name: t.name,
        price: t.price,
        duration_mins: 30
      }))
      await supabase.from('treatments').insert(treatmentData)
    }

    // 5. Initialize Reminder Settings
    await supabase.from('reminder_settings').insert({
      clinic_id: clinic.id,
      whatsapp_enabled: true,
      whatsapp_template_24h: 'appointment_reminder_v1',
      whatsapp_template_2h: 'appointment_reminder_v1'
    })

    // 6. Seed WhatsApp Templates (RPC call)
    await supabase.rpc('seed_default_whatsapp_templates', { p_clinic_id: clinic.id })

    revalidatePath('/dashboard')
    return { success: true, clinicId: clinic.id }

  } catch (error: any) {
    console.error('[Onboarding] Failed:', error)
    return { success: false, error: error.message }
  }
}
