import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // 1. Security headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // 2. Request logging (avoid throwing on malformed URLs)
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`)

    // 3. Cron protection (only when CRON_SECRET is set in env)
    if (request.nextUrl.pathname.startsWith('/api/cron')) {
      const authHeader = request.headers.get('authorization')
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    // 4. Webhooks — minimal handling (body parsed in route)
    if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
      return response
    }

    // 5. Patient portal
    if (request.nextUrl.pathname.startsWith('/portal') && !request.nextUrl.pathname.startsWith('/portal/login')) {
      const portalSession = request.cookies.get('portal_session')
      if (!portalSession) {
        return NextResponse.redirect(new URL('/portal/login', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('[middleware]', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
