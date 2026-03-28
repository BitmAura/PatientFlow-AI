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
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950">
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
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}
      >
        <div className="container mx-auto p-4 lg:p-6">
          <OnboardingGuard>
            <PullToRefresh onRefresh={handleRefresh}>
              {children}
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