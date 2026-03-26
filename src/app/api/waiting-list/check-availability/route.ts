import { NextRequest } from 'next/server';
import { checkWaitlistForSlot } from '@/lib/services/waiting-list';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { date, time, service_id } = await req.json();
    
    const supabase = createClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single();
    if (!staff) throw new Error("Staff not found");

    const entries = await checkWaitlistForSlot(staff.clinic_id, {
        date,
        start_time: time,
        end_time: ''
    });
    
    return successResponse(entries);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
