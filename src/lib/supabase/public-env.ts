/**
 * Public Supabase URL + anon key for browser and SSR clients.
 * GitHub Actions / `next build` often run without secrets; Supabase SDK throws if URL/key are empty.
 * Placeholders allow prerender to complete — set real env vars in Vercel and local `.env.local`.
 */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
/** Well-formed JWT shape; not tied to a real project — satisfies client init during CI builds only. */
const PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (url && anonKey) {
    return { url, anonKey }
  }
  return { url: PLACEHOLDER_URL, anonKey: PLACEHOLDER_ANON_KEY }
}
