'use client'

import { OnboardingWizard } from '@/components/auth/onboarding-wizard'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Shield } from 'lucide-react'

export default function OnboardingPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">

      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b bg-white/80 px-4 py-3 backdrop-blur-sm dark:bg-slate-950/80 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">P</div>
            <span className="text-base font-bold text-foreground">PatientFlow AI</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Security badge */}
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>Encrypted &amp; secure setup</span>
            </div>

            {/* Signed-in as */}
            {user?.email && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {user.email}
              </span>
            )}

            {/* Logout escape hatch */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <OnboardingWizard />

      {/* Footer data note */}
      <div className="py-6 text-center text-xs text-muted-foreground">
        🔒 Your clinic and patient data is stored securely and never shared with third parties.
        <br className="sm:hidden" />{' '}
        Questions? <a href="mailto:support@patientflow.ai" className="underline hover:text-foreground">Email support</a>
      </div>
    </div>
  )
}
