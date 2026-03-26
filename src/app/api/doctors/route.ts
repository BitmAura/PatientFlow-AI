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
      .eq('clinic_id', (staff as any).clinic_id)
      .eq('staff.status', 'active');

    if (error) throw error;
    
    // Filter out doctors where staff is null (soft deleted or inconsistent)
    const activeDoctors = (doctors as any[]).filter(d => d.staff);

    return successResponse(activeDoctors);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}