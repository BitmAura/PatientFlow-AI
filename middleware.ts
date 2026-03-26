import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Headers (Basic)
  const headers = new Headers(request.headers)
  headers.set('x-ratelimit-limit', '100')
  headers.set('x-ratelimit-remaining', '99')

  // 2. Security Headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // 3. Request Logging
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`)

  // 4. CRON Job Protection
  if (request.nextUrl.pathname.startsWith('/api/cron')) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // 5. Webhook Handling
  if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
    return response
  }

  // 6. Patient Portal Protection
  if (request.nextUrl.pathname.startsWith('/portal') && !request.nextUrl.pathname.startsWith('/portal/login')) {
    const portalSession = request.cookies.get('portal_session')
    if (!portalSession) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
