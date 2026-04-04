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
      // 2. Create Sample Leads with Revenue & Tier Data
      await supabase.from('leads').insert({
        clinic_id: clinicId,
        full_name: p.name,
        phone: p.phone,
        email: p.email,
        status: p.name.includes('Mike') ? 'converted' : 'lost',
        estimated_value: p.name.includes('Mike') ? 25000 : 5000,
        actual_revenue: p.name.includes('Mike') ? 25000 : 0,
        source: 'whatsapp_recall',
        treatment_type: p.name.includes('John') ? 'Dental Implant' : 'Cleaning',
        treatment_tier: p.name.includes('John') ? 'tier_1' : 'tier_3'
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

  // 4. Seed Treatment Pricing for Price AI
  const procedures = [
    { name: 'Teeth Cleaning', category: 'cleaning', tier: 'tier_3', price: 150000 }, // 1500 INR
    { name: 'Root Canal (RCT)', category: 'root_canal', tier: 'tier_2', price: 850000 }, // 8500 INR
    { name: 'Full Ceramic Implant', category: 'implant', tier: 'tier_1', price: 3500000 }, // 35000 INR
    { name: 'Invisalign / Ortho', category: 'ortho', tier: 'tier_1', price: 12000000 } // 1.2L INR
  ]

  for (const proc of procedures) {
    await supabase.from('treatments').insert({
      clinic_id: clinicId,
      name: proc.name,
      category: proc.category,
      tier: proc.tier as any,
      price_paise: proc.price
    })
  }

  console.log(`✅ Seeded demo data for clinic: ${clinicId}`)
}
