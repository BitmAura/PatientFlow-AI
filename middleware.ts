import { type NextRequest, NextResponse } from 'next/server'

/**
 * Keep middleware minimal for Vercel Edge — avoid forwarding `request.headers` into
 * `NextResponse.next({ request: ... })` (known to cause MIDDLEWARE_INVOCATION_FAILED on some deployments).
 * Cron / webhook auth stays in API route handlers.
 */
export function middleware(request: NextRequest) {
  try {
    if (
      request.nextUrl.pathname.startsWith('/portal') &&
      !request.nextUrl.pathname.startsWith('/portal/login')
    ) {
      const portalSession = request.cookies.get('portal_session')
      if (!portalSession) {
        const url = request.nextUrl.clone()
        url.pathname = '/portal/login'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }

    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    return response
  } catch (error) {
    console.error('[middleware]', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
