'use client'

import { LoginForm } from '@/components/auth/login-form'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextParam = searchParams?.get('next') || ''
  return (
    <div className="mx-auto w-full max-w-lg">
      <GlassCard className="p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New to PatientFlow AI for clinics?{' '}
            <Link
              href={`/signup${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
              className="font-medium text-primary transition-colors hover:text-primary/90"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="space-y-6">
          <Link
            href="/demo"
            className="block rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Continue as Guest (Live Demo)
          </Link>

          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>
      </GlassCard>
    </div>
  )
}
