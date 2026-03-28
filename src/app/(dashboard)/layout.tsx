'use client'

import * as React from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileHeader } from '@/components/layout/mobile-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils/cn'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { PullToRefresh } from '@/components/shared/pull-to-refresh'
import { useRouter } from 'next/navigation'
import { UnifiedHeader } from '@/components/shared/unified-header'
import { OnboardingGuard } from '@/components/auth/onboarding-guard'
import { DashboardThemeToggle } from '@/components/dashboard/theme-toggle'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useUIStore()
  const router = useRouter()

  const handleRefresh = async () => {
    router.refresh()
    // Small delay to make the refresh feel substantial
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(152_25%_97%)_35%,hsl(var(--background))_100%)] dark:bg-slate-950 dark:bg-none">
      {/* Unified Header - Shows service toggle */}
      <UnifiedHeader 
        currentService="noshow" 
        logoText="PatientFlow AI"
      />
      
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>
      
      <main
        className={cn(
          'transition-all duration-300',
          'pt-32 md:pt-24',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        <div className="container mx-auto px-3 pb-6 pt-2 sm:px-4 lg:px-6">
          <OnboardingGuard>
            <PullToRefresh onRefresh={handleRefresh}>
              <DashboardShell>{children}</DashboardShell>
            </PullToRefresh>
          </OnboardingGuard>
        </div>
      </main>

      <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
        <DashboardThemeToggle />
      </div>
      
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
      
      <InstallPrompt />
    </div>
  )
}