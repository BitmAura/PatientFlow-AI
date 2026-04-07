import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const { data, options } = await request.json()
  const supabase = createClient() as any
  const ip = getClientIp(request)

  const ipLimiter = await checkRateLimitAsync(`patients-import:ip:${ip}`, 10, 60_000)
  if (!ipLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many import attempts. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(ipLimiter.remaining),
        },
      }
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return new NextResponse('Unauthorized', { status: 403 })

  const userLimiter = await checkRateLimitAsync(`patients-import:user:${user.id}`, 5, 10 * 60_000)
  if (!userLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many imports by this account. Please wait and retry.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(userLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(userLimiter.remaining),
        },
      }
    )
  }

  const results = {
    total: data.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as any[]
  }

  // Process in batches of 50
  const BATCH_SIZE = 50
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    
    // For each patient in batch
    for (const patient of batch) {
      try {
        const { row } = patient
        
        // Check duplicate
        const { data: existing } = await supabase
          .from('patients')
          .select('id')
          .eq('clinic_id', (staff as any).clinic_id)
          .eq('phone', row.phone)
          .single()

        if (existing) {
          if (options.duplicate_handling === 'skip') {
            results.skipped++
            continue
          }
          if (options.duplicate_handling === 'update') {
            await supabase
              .from('patients' as any)
              .update({
                ...row,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
            results.success++
            continue
          }
        }

        // Create new
        const { error } = await supabase
          .from('patients' as any)
          .insert({
            ...row,
            clinic_id: (staff as any).clinic_id,
            source: options.default_source || 'import',
            requires_deposit: options.requires_deposit || false,
            // Convert tags string to whatever format you use (array or jsonb)
            // custom_fields: { tags: options.tags } 
          })

        if (error) throw error
        results.success++

      } catch (err: any) {
        results.failed++
        results.errors.push({
          row: patient.row,
          error: err.message
        })
      }
    }
  }

  await writeAuditLog({
    clinicId: (staff as any).clinic_id,
    userId: user.id,
    action: 'import',
    entityType: 'patients',
    newValues: {
      total_rows: results.total,
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      duplicate_handling: options?.duplicate_handling || null,
      default_source: options?.default_source || null,
    },
    request,
  })

  return NextResponse.json(results)
}
