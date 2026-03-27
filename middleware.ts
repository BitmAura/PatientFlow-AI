import { type NextRequest, NextResponse } from 'next/server'

/**
 * Only run on /portal/* so the Edge runtime never touches "/" or other pages.
 * Global MIDDLEWARE_INVOCATION_FAILED on Vercel often came from matcher/bundle issues affecting all routes.
 * 
 * NOTE: Full session validation happens server-side in portal pages (verifyPortalSession).
 * This middleware only checks if cookie exists as a first gate.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/portal/login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/portal')) {
    const portalSession = request.cookies.get('portal_session')
    if (!portalSession || !portalSession.value) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal', '/portal/:path*'],
}
