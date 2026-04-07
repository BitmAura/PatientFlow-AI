import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clinicDetailsSchema } from '@/lib/validations/auth'
import { addressSchema } from '@/lib/validations/auth'

export const dynamic = 'force-dynamic'

type ClinicDetails = { name: string; description?: string; phone: string; email: string; website?: string }
type Address = { addressLine1: string; addressLine2?: string; city: string; state: string; postalCode: string; country: string }
type DoctorData = { doctorName: string; doctorPhone: string; doctorEmail?: string; qualification?: string }
type ServiceData = { serviceName: string; servicePrice: string; serviceDuration: string }

/**
 * POST /api/onboarding/complete
 * Creates clinic + staff for the authenticated user so they are "linked to a clinic".
 * Doctor's phone from signup is in auth user_metadata; clinic phone/email come from form.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { clinic?: ClinicDetails; address?: Address; doctor?: DoctorData; service?: ServiceData }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const clinicPayload = body.clinic
  const addressPayload = body.address
  const doctorPayload = body.doctor
  const servicePayload = body.service

  if (!clinicPayload?.name || !clinicPayload?.phone || !clinicPayload?.email) {
    return NextResponse.json(
      { error: 'Clinic name, phone, and email are required' },
      { status: 400 }
    )
  }

  const clinicResult = clinicDetailsSchema.safeParse(clinicPayload)
  if (!clinicResult.success) {
    return NextResponse.json({ error: clinicResult.error.flatten().fieldErrors }, { status: 400 })
  }

  const addressResult = addressPayload ? addressSchema.safeParse(addressPayload) : { success: true as const, data: null }
  if (addressPayload && !addressResult.success) {
    return NextResponse.json({ error: addressResult.error.flatten().fieldErrors }, { status: 400 })
  }

  const admin = createAdminClient()
  const clinicData = clinicResult.data
  const addressData = addressResult.success && addressResult.data ? addressResult.data : null

  // 1. Check user doesn't already have a clinic (idempotent)
  const { data: existingStaff } = await admin
    .from('staff')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existingStaff) {
    return NextResponse.json({ success: true, message: 'Already onboarded' })
  }

  // 2. Create clinic
  const slug =
    clinicData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `clinic-${Date.now()}`

  const { data: clinic, error: clinicError } = await admin
    .from('clinics')
    .insert({
      name: clinicData.name,
      description: clinicData.description || null,
      phone: clinicData.phone,
      email: clinicData.email,
      website: clinicData.website || null,
      address_line1: addressData?.addressLine1 || null,
      address_line2: addressData?.addressLine2 || null,
      city: addressData?.city || null,
      state: addressData?.state || null,
      postal_code: addressData?.postalCode || null,
      country: addressData?.country || null,
      slug: slug,
      onboarding_status: 'completed',
      status: 'active',
    } as any)
    .select('id')
    .single()

  if (clinicError || !clinic) {
    console.error('Onboarding: clinic insert failed', clinicError)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }

  // 3. Create staff (owner) linked to this user and clinic.
  // Doctor's phone from signup is in user.user_metadata.phone; clinic phone is on clinics row.
  const { error: staffError } = await admin
    .from('staff')
    .insert({
      clinic_id: clinic.id,
      user_id: user.id,
      role: 'owner',
      email: user.email || clinicData.email,
      status: 'active',
    } as any)

  if (staffError) {
    console.error('Onboarding: staff insert failed', staffError)
    return NextResponse.json({ error: 'Failed to link you to the clinic' }, { status: 500 })
  }

  // 4. Seed demo patients so new users see a non-empty dashboard
  const demoPatients = [
    { full_name: 'Priya Sharma (Demo)', phone: '9000000001', email: 'priya.demo@example.com', lifecycle_stage: 'active', whatsapp_opt_in: true },
    { full_name: 'Rahul Verma (Demo)',  phone: '9000000002', email: 'rahul.demo@example.com', lifecycle_stage: 'inactive', whatsapp_opt_in: true },
    { full_name: 'Anita Patel (Demo)',  phone: '9000000003', email: 'anita.demo@example.com', lifecycle_stage: 'new', whatsapp_opt_in: false },
  ]
  for (const p of demoPatients) {
    await admin.from('patients').insert({
      clinic_id: clinic.id,
      ...p,
      tags: ['demo'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any).select('id').single()
  }

  // 5. Create first doctor (optional — from wizard step)
  if (doctorPayload?.doctorName && doctorPayload?.doctorPhone) {
    await admin
      .from('doctors')
      .insert({
        clinic_id: clinic.id,
        name: doctorPayload.doctorName,
        phone: `+91${doctorPayload.doctorPhone}`,
        email: doctorPayload.doctorEmail || null,
        qualification: doctorPayload.qualification || null,
        is_active: true,
      } as any)
  }

  // 6. Create first service (optional)
  if (servicePayload?.serviceName && servicePayload?.servicePrice) {
    await admin
      .from('services')
      .insert({
        clinic_id: clinic.id,
        name: servicePayload.serviceName,
        price: parseFloat(servicePayload.servicePrice),
        duration: parseInt(servicePayload.serviceDuration || '30', 10),
        is_active: true,
        display_order: 1,
      } as any)
  }

  return NextResponse.json({ success: true, clinicId: clinic.id })
}
