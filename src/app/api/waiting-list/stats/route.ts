import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { startOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single();
    if (!staff) throw new Error("Staff not found");

    const clinicId = staff.clinic_id;

    const [waiting, notified, converted] = await Promise.all([
      supabase.from('waiting_list').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'waiting'),
      supabase.from('waiting_list').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'notified'),
      supabase.from('waiting_list').select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'booked')
        .gte('updated_at', startOfMonth(new Date()).toISOString())
    ]);

    return successResponse({
      waiting: waiting.count || 0,
      notified: notified.count || 0,
      converted: converted.count || 0
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
