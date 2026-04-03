/**
 * API Key Management — Pro plan only
 *
 * GET    /api/developer/keys   → list keys for clinic
 * POST   /api/developer/keys   → create new key (plaintext returned once)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePlanId, PRICING_PLANS } from '@/lib/billing/plans'
import crypto from 'crypto'

const KEY_PREFIX = 'pfai_'
const MAX_KEYS = 10

async function getClinicAndPlan(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: staff } = await supabase
    .from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!staff?.clinic_id) return null
  const { data: sub } = await supabase
    .from('subscriptions').select('plan_id')
    .eq('clinic_id', staff.clinic_id).eq('status', 'active').maybeSingle()
  const planId = normalizePlanId(sub?.plan_id)
  return { clinicId: staff.clinic_id as string, userId: user.id as string, planId }
}

export async function GET() {
  const supabase = createClient() as any
  const ctx = await getClinicAndPlan(supabase)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!PRICING_PLANS[ctx.planId].featureFlags.apiAccess) {
    return NextResponse.json({ error: 'API access requires the Pro plan.' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('clinic_api_keys')
    .select('id, name, key_prefix, scopes, last_used_at, expires_at, created_at, is_active')
    .eq('clinic_id', ctx.clinicId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keys: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient() as any
  const ctx = await getClinicAndPlan(supabase)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!PRICING_PLANS[ctx.planId].featureFlags.apiAccess) {
    return NextResponse.json({ error: 'API access requires the Pro plan. Please upgrade.' }, { status: 403 })
  }

  // Check max key limit
  const { count } = await supabase
    .from('clinic_api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', ctx.clinicId)
    .eq('is_active', true)

  if ((count ?? 0) >= MAX_KEYS) {
    return NextResponse.json({ error: `Maximum of ${MAX_KEYS} active keys allowed.` }, { status: 400 })
  }

  const body = await req.json()
  const { name, scopes = ['read'] } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Key name is required.' }, { status: 400 })
  }

  const validScopes = ['read', 'write', 'admin']
  const sanitizedScopes = (scopes as string[]).filter(s => validScopes.includes(s))
  if (sanitizedScopes.length === 0) {
    return NextResponse.json({ error: 'At least one valid scope required: read, write, admin.' }, { status: 400 })
  }

  // Generate key: pfai_ + 32 random hex chars
  const rawRandom = crypto.randomBytes(16).toString('hex')
  const plaintext = `${KEY_PREFIX}${rawRandom}`
  const keyHash = crypto.createHash('sha256').update(plaintext).digest('hex')
  const keyPrefix = plaintext.substring(0, 12) // "pfai_" + first 7 chars

  const admin = createAdminClient() as any
  const { data, error } = await admin
    .from('clinic_api_keys')
    .insert({
      clinic_id: ctx.clinicId,
      name: name.trim(),
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes: sanitizedScopes,
      created_by: ctx.userId,
    })
    .select('id, name, key_prefix, scopes, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return plaintext ONCE — never stored
  return NextResponse.json({ key: { ...data, plaintext }, warning: 'Copy this key now. It will not be shown again.' }, { status: 201 })
}
