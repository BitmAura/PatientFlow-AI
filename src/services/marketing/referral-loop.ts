import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

/**
 * Referral Loop Logic
 * 🚀 Purpose: Automate viral growth by nudging happy patients to refer friends.
 */

export class ReferralService {
  /**
   * Generates a unique referral code and sends a nudge message.
   * Triggered after a successful high-tier treatment.
   */
  static async triggerReferralNudge(clinicId: string, patientId: string) {
    const supabase = createAdminClient() as any
    
    // 1. Fetch Patient & Clinic info
    const { data: patient } = await supabase
      .from('patients')
      .select('full_name, phone')
      .eq('id', patientId)
      .single()

    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single()

    if (!patient || !clinic) return

    // 2. Generate or Fetch Referral Link
    const referralCode = `AURA-${patient.full_name.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await supabase.from('referral_links').upsert({
      clinic_id: clinicId,
      patient_id: patientId,
      referral_code: referralCode
    } as any, { onConflict: 'clinic_id,patient_id' })

    // 3. Send the "Gift a Healthy Smile" nudge
    const message = `Hi ${patient.full_name}! We loved having you at ${clinic.name}. 🌟\n\nSince you're one of our valued patients, we'd love to help your friends too! Gift them a ₹500 discount on their first visit using your code: *${referralCode}*.\n\nWhen they book, we'll add a special credit to your next visit too! Share the love. ❤️`
    
    await sendWhatsAppMessage(clinicId, patient.phone, message, {
      type: 'referral_nudge',
      patientId
    } as any)
  }

  /**
   * Process an incoming referral code
   */
  static async applyReferralCode(clinicId: string, referredPatientId: string, code: string) {
    const supabase = createAdminClient() as any
    
    // 1. Validate code
    const { data: link } = await supabase
      .from('referral_links')
      .select('patient_id')
      .eq('clinic_id', clinicId)
      .eq('referral_code', code.toUpperCase())
      .single()

    if (!link) return false

    // 2. Attribute conversion
    await supabase.from('referral_attributions').upsert({
      clinic_id: clinicId,
      referrer_patient_id: link.patient_id,
      referred_patient_id: referredPatientId,
      status: 'pending'
    } as any, { onConflict: 'referred_patient_id' })

    return true
  }
}
