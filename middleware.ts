import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { updateSession } from '@/lib/supabase/middleware'

function getPortalJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    return new TextEncoder().encode('dev-only-jwt-secret')
  }

  return new TextEncoder().encode(secret)
}

async function hasValidPortalSession(token: string | undefined): Promise<boolean> {
  if (!token) return false

  try {
    await jwtVerify(token, getPortalJwtSecret())
    return true
  } catch {
    return false
  }
}

/**
 * Patient portal: cookie gate (full validation happens in portal routes).
 * Staff app: Supabase session refresh + unauthenticated redirect to /login for protected routes.
 *
 * Matcher is explicit (not global `/:path*`) to avoid Edge bundle issues on some deployments.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const portalToken = request.cookies.get('portal_session')?.value

  if (pathname.startsWith('/portal/login')) {
    const validSession = await hasValidPortalSession(portalToken)
    if (validSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      url.search = ''
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/portal')) {
    const validSession = await hasValidPortalSession(portalToken)
    if (!validSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      url.search = ''

      const response = NextResponse.redirect(url)
      response.cookies.delete('portal_session')
      return response
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
