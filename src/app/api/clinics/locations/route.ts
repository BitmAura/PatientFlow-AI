/**
 * Multi-location management
 *
 * GET  /api/clinics/locations  → List all locations for the authenticated clinic
 * POST /api/clinics/locations  → Create a new location (plan-gated)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PRICING_PLANS, normalizePlanId } from '@/lib/billing/plans'

async function getClinicAndPlan(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return null

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('clinic_id', staff.clinic_id)
    .eq('status', 'active')
    .maybeSingle()

  const planId = normalizePlanId(sub?.plan_id)
  const plan = PRICING_PLANS[planId]

  return { clinicId: staff.clinic_id as string, plan }
}

export async function GET() {
  const supabase = createClient() as any
  const ctx = await getClinicAndPlan(supabase)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('clinic_locations')
    .select('id, name, address, city, phone, is_primary, is_active, created_at')
    .eq('clinic_id', ctx.clinicId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ locations: data ?? [], plan: ctx.plan.id, maxLocations: ctx.plan.maxLocations })
}

export async function POST(req: NextRequest) {
  const supabase = createClient() as any
  const ctx = await getClinicAndPlan(supabase)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan limit
  if (ctx.plan.maxLocations !== -1) {
    const { count } = await supabase
      .from('clinic_locations')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', ctx.clinicId)
      .eq('is_active', true)

    if ((count ?? 0) >= ctx.plan.maxLocations) {
      return NextResponse.json(
        { error: `Your ${ctx.plan.id} plan supports up to ${ctx.plan.maxLocations} location(s). Upgrade to add more.` },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { name, address, city, phone } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
  }

  const admin = createAdminClient() as any
  const { data, error } = await admin
    .from('clinic_locations')
    .insert({ clinic_id: ctx.clinicId, name: name.trim(), address, city, phone, is_primary: false })
    .select('id, name, address, city, phone, is_primary, is_active')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ location: data }, { status: 201 })
}
