import { NextRequest } from 'next/server';
import { notifyPatient } from '@/lib/services/waiting-list';
import { notifyPatientSchema } from '@/lib/validations/waiting-list';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-response';

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const json = await req.json();
    const result = notifyPatientSchema.safeParse(json);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    await notifyPatient(context.params.id, {
      date: result.data.available_date,
      start_time: result.data.available_time,
      end_time: '' // Not needed for notification
    });
    
    return successResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

