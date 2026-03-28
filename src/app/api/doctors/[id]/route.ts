import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const supabase = createClient();
    
    // Fetch doctor with services
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        *,
        services:doctor_services(service_id)
      `)
      .eq('id', context.params.id)
      .single();

    if (error || !doctor) return notFoundResponse();
    
    // Transform to include service_ids array
    const result = {
        ...(doctor as any),
        service_ids: (doctor as any).services.map((s: any) => s.service_id)
    };

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
