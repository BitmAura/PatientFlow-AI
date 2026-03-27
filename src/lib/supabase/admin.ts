import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getSupabasePublicEnv } from '@/lib/supabase/public-env'

// Note: This client should ONLY be used in server-side contexts where admin privileges are required.
// NEVER expose the service role key to the client/browser.

export const createAdminClient = () => {
  const { url } = getSupabasePublicEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations (API routes, webhooks, cron).'
    )
  }
  return createClient<Database>(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
