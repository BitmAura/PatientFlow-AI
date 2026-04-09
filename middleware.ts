import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimitAsync } from '@/lib/security/rate-limit'

// ─── Distributed Rate Limiting ───────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute
const RATE_LIMIT_MAX = 30            // max requests per IP per window on public routes

// Public routes that need rate limiting (regex)
const PUBLIC_RATE_LIMITED = /^\/(api\/booking|api\/portal|book)\//

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

  // ── Rate limit public-facing API and booking routes ───────────────────────
  if (PUBLIC_RATE_LIMITED.test(pathname)) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    const { allowed, retryAfterSeconds } = await checkRateLimitAsync(`edge-limit:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)

    if (!allowed) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      })
    }
  }

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
    '/inbox',
    '/inbox/:path*',
    '/audit-logs',
    '/audit-logs/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-email',
    '/api/booking/:path*',
    '/api/portal/:path*',
  ],
}
