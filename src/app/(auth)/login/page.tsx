'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextParam = searchParams?.get('next') || ''
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          ← Back to home
        </Link>
      </div>
      <GlassCard className="p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                New to PatientFlow AI for clinics?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-primary transition-colors hover:text-primary/90"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-primary transition-colors hover:text-primary/90"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          <Link
            href="/demo"
            className="block rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Continue as Guest (Live Demo)
          </Link>

          {mode === 'login' ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}

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
