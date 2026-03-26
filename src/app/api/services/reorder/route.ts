import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { orders } = await request.json() // [{ id, order }]

  if (!orders || !Array.isArray(orders)) {
    return new NextResponse('Invalid body', { status: 400 })
  }

  // Execute updates in parallel or transaction
  // Supabase doesn't support bulk update with different values easily via JS client
  // So we loop. For small number of services (<50), this is fine.
  
  const updates = orders.map(({ id, order }) => 
    supabase.from('services').update({ display_order: order }).eq('id', id)
  )

  await Promise.all(updates)

  return NextResponse.json({ success: true })
}
