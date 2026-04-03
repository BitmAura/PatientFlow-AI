import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-response';
import { createDoctorSchema } from '@/lib/validations/doctor';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single();
    if (!staff) throw new Error("Staff not found");

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        *,
        staff:staff(
            id,
            user_id,
            status,
            role,
            user:users(full_name, avatar_url, phone, email)
        ),
        services:doctor_services(service_id)
      `)
      .eq('clinic_id', (staff as any).clinic_id);
      // Note: do NOT filter on staff.status via .eq() — PostgREST doesn't support
      // filtering on joined tables that way. Filter in JS below instead.

    if (error) throw error;

    // Filter out doctors with no active staff record (soft deleted / unlinked)
    const activeDoctors = (doctors as any[]).filter(
      d => d.staff && (!d.staff.status || d.staff.status === 'active')
    );

    return successResponse(activeDoctors);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}