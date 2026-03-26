import { NextRequest } from 'next/server';
import { convertToAppointment } from '@/lib/services/waiting-list';
import { convertToAppointmentSchema } from '@/lib/validations/waiting-list';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const result = convertToAppointmentSchema.safeParse(json);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    await convertToAppointment(params.id, result.data);
    return successResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
