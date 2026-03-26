import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { data, options } = await request.json()
  const supabase = createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

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

  return NextResponse.json(results)
}
