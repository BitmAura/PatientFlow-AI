'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Redirects to /onboarding if the current user has no staff row (not linked to a clinic).
 * Use inside dashboard layout so users complete onboarding before using the app.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<'checking' | 'allowed' | 'redirecting'>('checking')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        const next = encodeURIComponent(pathname || '/dashboard')
        setStatus('redirecting')
        router.replace(`/login?next=${next}`)
        return
      }

      const { data: staff, error } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('OnboardingGuard staff check failed:', error)
        setStatus('allowed')
        return
      }
      if (!staff) {
        setStatus('redirecting')
        if (pathname !== '/onboarding') router.replace('/onboarding')
      } else {
        setStatus('allowed')
      }
    }

    void check()

    return () => {
      cancelled = true
    }
  }, [router, pathname])

  if (status === 'checking') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (status === 'redirecting') {
    return null
  }

  return <>{children}</>
}
