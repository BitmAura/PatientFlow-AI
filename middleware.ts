import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Patient portal: cookie gate (full validation happens in portal routes).
 * Staff app: Supabase session refresh + unauthenticated redirect to /login for protected routes.
 *
 * Matcher is explicit (not global `/:path*`) to avoid Edge bundle issues on some deployments.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/portal/login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/portal')) {
    const portalSession = request.cookies.get('portal_session')
    if (!portalSession?.value) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/appointments',
    '/appointments/:path*',
    '/patients',
    '/patients/:path*',
    '/leads',
    '/leads/:path*',
    '/campaigns',
    '/campaigns/:path*',
    '/followups',
    '/followups/:path*',
    '/reminders',
    '/reminders/:path*',
    '/reports',
    '/reports/:path*',
    '/services',
    '/services/:path*',
    '/settings',
    '/settings/:path*',
    '/waiting-list',
    '/waiting-list/:path*',
    '/notifications',
    '/notifications/:path*',
    '/journeys',
    '/journeys/:path*',
    '/recalls',
    '/recalls/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-email',
  ],
}
