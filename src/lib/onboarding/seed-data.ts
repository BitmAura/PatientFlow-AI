import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Onboarding See Data Utility
 * 🚀 Activated by: CEO/Founder Persona
 * 🏗️ Built by: Backend Architect
 * Purpose: Provides instant ROI visibility for new signups.
 */
export async function seedClinicOnboardingData(clinicId: string) {
  const supabase = createAdminClient() as any
  
  // 1. Create Sample Patients
  const samplePatients = [
    { name: 'John Doe (Sample)', email: 'john@example.com', phone: '919988776655' },
    { name: 'Sarah Smith (Sample)', email: 'sarah@example.com', phone: '919977665544' },
    { name: 'Dr. Mike (Sample)', email: 'mike@example.com', phone: '919966554433' }
  ]

  for (const p of samplePatients) {
    const { data: patient } = await supabase.from('patients').insert({
      clinic_id: clinicId,
      full_name: p.name,
      phone: p.phone,
      email: p.email,
      status: 'active'
    }).select().single()

    if (patient) {
      // 2. Create Sample Leads with Revenue Data
      await supabase.from('leads').insert({
        clinic_id: clinicId,
        full_name: p.name,
        phone: p.phone,
        email: p.email,
        status: p.name.includes('Mike') ? 'booked' : 'new',
        estimated_value: 2500,
        actual_revenue: p.name.includes('Mike') ? 2500 : 0,
        source: 'whatsapp_recall',
        treatment_type: 'Cleaning'
      })

      // 3. Create Overdue Recalls for the Dashboard
      await supabase.from('patient_recalls').insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        status: 'overdue',
        last_visit_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days ago
        attempt_count: 0
      })
    }
  }

  console.log(`✅ Seeded demo data for clinic: ${clinicId}`)
}
