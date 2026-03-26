import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('doctor_services')
      .select('service_id, services(name, duration, price)')
      .eq('doctor_id', params.id);

    if (error) throw error;
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
