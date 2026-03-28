import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const { data, options } = await request.json()
  const supabase = createClient()
  const ip = getClientIp(request)

  const ipLimiter = checkRateLimit(`leads-import:ip:${ip}`, 10, 60_000)
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

  const userLimiter = checkRateLimit(`leads-import:user:${user.id}`, 5, 10 * 60_000)
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

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return new NextResponse('Unauthorized', { status: 403 })

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
    
    // For each lead in batch
    for (const lead of batch) {
      try {
        const { row } = lead
        
        // Clean data
        const payload: any = {
          full_name: row.full_name,
          phone: row.phone,
          email: row.email,
          source: row.source || 'manual', // Default to manual if not specified
          status: row.status || 'new',
          interest: row.interest,
          notes: row.notes,
          clinic_id: (staff as any).clinic_id
        }

        // Validate Source enum if present
        const validSources = ['facebook_ad', 'google_ad', 'website', 'referral', 'manual']
        if (payload.source && !validSources.includes(payload.source)) {
          payload.source = 'manual' // Fallback
        }

        // Validate Status enum if present
        const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        if (payload.status && !validStatuses.includes(payload.status)) {
          payload.status = 'new' // Fallback
        }

        // Check duplicate if phone exists
        if (payload.phone) {
          const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('clinic_id', (staff as any).clinic_id)
            .eq('phone', payload.phone)
            .single()

          if (existing) {
            results.skipped++
            continue
          }
        }

        // Insert lead
        const { error } = await supabase
          .from('leads')
          .insert(payload)

        if (error) {
          results.failed++
          results.errors.push({ row: lead.row, error: error.message })
        } else {
          results.success++
        }
      } catch (error: any) {
        results.failed++
        results.errors.push({ row: lead.row, error: error.message })
      }
    }
  }

  await writeAuditLog({
    clinicId: (staff as any).clinic_id,
    userId: user.id,
    action: 'import',
    entityType: 'leads',
    newValues: {
      total_rows: results.total,
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      options: options || null,
    },
    request,
  })

  return NextResponse.json(results)
}