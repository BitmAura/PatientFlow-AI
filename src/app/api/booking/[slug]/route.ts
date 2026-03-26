import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()

  // 1. Get clinic by slug
  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !clinic) {
    return new NextResponse('Clinic not found', { status: 404 })
  }

  // 2. Get services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('clinic_id', (clinic as any).id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // 3. Get doctors
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*')
    .eq('clinic_id', (clinic as any).id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return NextResponse.json({
    clinic,
    services,
    doctors
  })
}