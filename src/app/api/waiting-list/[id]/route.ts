import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { removeFromWaitlist } from '@/lib/services/waiting-list';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('waiting_list')
      .select(`
        *,
        patient:patients(id, full_name, phone, email),
        service:services(id, name, duration)
      `)
      .eq('id', context.params.id)
      .single();

    if (error || !data) return notFoundResponse();
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    await removeFromWaitlist(context.params.id);
    return successResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

