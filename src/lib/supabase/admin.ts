import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Note: This client should ONLY be used in server-side contexts where admin privileges are required.
// NEVER expose the service role key to the client/browser.

export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
