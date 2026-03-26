import { NextRequest } from 'next/server';
import { getWaitlist, addToWaitlist } from '@/lib/services/waiting-list';
import { addToWaitlistSchema } from '@/lib/validations/waiting-list';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/utils/api-response';
import { WaitlistStatus } from '@/types/waiting-list';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') as WaitlistStatus | undefined;
    const service_id = searchParams.get('service_id') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const data = await getWaitlist({ status, service_id, page, limit });
    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const result = addToWaitlistSchema.safeParse(json);
    
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    await addToWaitlist(result.data);
    return successResponse({ success: true }, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
