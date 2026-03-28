import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { doctorAvailabilitySchema } from '@/lib/validations/doctor';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('doctors')
      .select('availability_overrides')
      .eq('id', context.params.id)
      .single();

    if (error) throw error;
    return successResponse((data as any)?.availability_overrides || {});
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const json = await req.json();
    const validation = doctorAvailabilitySchema.safeParse(json);
    
    if (!validation.success) {
      return errorResponse('Invalid availability data', 400);
    }

    const supabase = createClient();
    const updateData = {
      availability_overrides: validation.data
    } as any;

    const { data, error } = await (supabase as any)
      .from('doctors')
      .update(updateData)
      .eq('id', context.params.id)
      .select('availability_overrides')
      .single();

    if (error) throw error;
    return successResponse((data as any)?.availability_overrides || {});
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
