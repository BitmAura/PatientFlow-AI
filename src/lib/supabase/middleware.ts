import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Check auth status
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      // If there's an auth error (e.g. invalid token), treat as logged out
      // console.error('Auth error in middleware:', error)
    }

    // Protected routes pattern (must be logged in)
    const protectedPaths = [
      '/dashboard',
      '/onboarding',
      '/appointments',
      '/patients',
      '/leads',
      '/campaigns',
      '/followups',
      '/reminders',
      '/reports',
      '/services',
      '/settings',
      '/waiting-list',
      '/notifications',
      '/journeys',
      '/recalls',
    ]

    // Auth routes where logged-in users are sent to the app (onboarding still allowed separately)
    const authPaths = ['/login', '/signup', '/forgot-password']

    const pathname = request.nextUrl.pathname
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))

    // Redirect unauthenticated users to login
    if (!user && isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages (preserve ?next= when safe)
    if (user && isAuthPath) {
      const url = request.nextUrl.clone()
      const nextParam = request.nextUrl.searchParams.get('next')
      if (
        nextParam &&
        nextParam.startsWith('/') &&
        !nextParam.startsWith('//')
      ) {
        url.pathname = nextParam
        url.searchParams.delete('next')
      } else {
        url.pathname = '/dashboard'
        url.search = ''
      }
      return NextResponse.redirect(url)
    }
  } catch (e) {
    // If Supabase client creation fails or other errors, log but allow request to proceed
    // to avoid breaking the entire app. The page components will handle auth checks too.
    console.error('Middleware error:', e)
  }

  return response
}
