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
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const next = encodeURIComponent(pathname || '/dashboard')
        router.replace(`/login?next=${next}`)
        setAllowed(false)
        return
      }

      const { data: staff, error } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('OnboardingGuard staff check failed:', error)
        setAllowed(true)
        return
      }
      if (!staff) {
        if (pathname !== '/onboarding') router.replace('/onboarding')
        setAllowed(false)
      } else {
        setAllowed(true)
      }
    }
    check()
  }, [router, pathname])

  if (allowed === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (allowed === false) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  return <>{children}</>
}
