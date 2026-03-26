import { NextResponse } from 'next/server'
import { markAsRead } from '@/lib/services/notifications'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  await markAsRead(params.id)

  return NextResponse.json({ success: true })
}
