import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LeadService } from '@/services/lead-service'

export const dynamic = 'force-dynamic' // No caching

export async function GET(req: NextRequest) {
  // 1. Verify Cron Secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Use admin client so cron bypasses RLS (no user session in cron)
  const supabase = createAdminClient()
  const startTime = new Date().getTime();

  // 2. Get All Active Clinics
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('id, name')
    .eq('status', 'active');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  const safeClinics = (clinics || []) as any[];

  // 3. Process Each Clinic
  for (const clinic of safeClinics) {
    try {
      await LeadService.processFollowUps(supabase as any, clinic.id);
      results.push({ clinic: clinic.name, status: 'processed' });
    } catch (e) {
      console.error(`Error processing leads for clinic ${clinic.name}:`, e);
      results.push({ clinic: clinic.name, error: String(e) });
    }
  }

  const duration = new Date().getTime() - startTime;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    duration_ms: duration,
    results
  });
}
