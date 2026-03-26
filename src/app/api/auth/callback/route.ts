import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: staff } = user
        ? await supabase.from('staff').select('id').eq('user_id', user.id).maybeSingle()
        : { data: null }
      const destination = staff ? next : '/onboarding'
      return NextResponse.redirect(`${requestUrl.origin}${destination}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not authenticate user`)
}
