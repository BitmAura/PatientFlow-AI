import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { updateSession } from '@/lib/supabase/middleware'

// ─── Simple in-process IP rate limiter ───────────────────────────────────────
// Suitable for Vercel Edge (single-instance window per cold start).
// Each entry: { count, windowStart }
const ipHits = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute
const RATE_LIMIT_MAX = 30            // max requests per IP per window on public routes

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count++
  if (entry.count > RATE_LIMIT_MAX) return true
  return false
}

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

    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
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
