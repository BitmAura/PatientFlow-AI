import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

type AuditLogInput = {
  clinicId?: string | null
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  request?: Request
}

function extractClientMetadata(request?: Request) {
  if (!request) {
    return { ipAddress: null as string | null, userAgent: null as string | null }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const ipAddress = forwardedFor?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || null

  return {
    ipAddress,
    userAgent: request.headers.get('user-agent') || null,
  }
}

export async function writeAuditLog(input: AuditLogInput) {
  try {
    const supabase = createAdminClient()
    const metadata = extractClientMetadata(input.request)

    const { error } = await (supabase as any)
      .from('audit_logs')
      .insert({
        clinic_id: input.clinicId || null,
        user_id: input.userId || null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        old_values: input.oldValues || null,
        new_values: input.newValues || null,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
      })

    if (error) {
      logError('Failed to write audit log', error, {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
      })
    }
  } catch (error) {
    logError('Unexpected audit log failure', error, {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    })
  }
}
