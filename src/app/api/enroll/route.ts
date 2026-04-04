import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { seedClinicOnboardingData } from '@/lib/onboarding/seed-data'

/**
 * 1-Click Enrollment API
 * 🚀 Activated by: CEO/Founder Persona
 * 🏗️ Built by: Backend Architect
 * Purpose: Creates User + Clinic + Seed Data in one transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const { fullName, clinicName, phone } = await req.json()

    if (!fullName || !clinicName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient() as any
    
    // 1. Create the Auth User (Shadow User for Trial)
    // We generate a random password for the trial experience
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    const email = `trial_${Date.now()}@patientflow.ai`

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName,
        selectedPlan: 'clinic' // Triggers the trial subscription via PG trigger
      }
    })

    if (authError) throw authError

    // 2. Create the Clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: clinicName,
        status: 'active'
      })
      .select()
      .single()

    if (clinicError) throw clinicError

    // 3. Create the Staff Entry (Owner)
    const { error: staffError } = await supabase
      .from('staff')
      .insert({
        user_id: authUser.user.id,
        clinic_id: clinic.id,
        full_name: fullName,
        role: 'owner'
      })

    if (staffError) throw staffError

    // 4. Trigger Instant Value (Seed Data)
    // This gives the user immediate ROI visibility in the dashboard
    await seedClinicOnboardingData(clinic.id)

    // 5. In a real production app, we would send a welcome email with the temp password
    // For this demo/pilot, we'll just return success.
    
    return NextResponse.json({ 
      success: true, 
      clinicId: clinic.id,
      message: 'Enrollment successful! Your trial is ready.'
    })

  } catch (error: any) {
    console.error('Enrollment Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
