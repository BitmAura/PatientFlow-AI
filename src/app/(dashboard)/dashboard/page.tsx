'use client'

import { useAuth } from '@/hooks/use-auth'
import { PageContainer } from '@/components/layout/page-container'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueImpactPanel } from '@/components/dashboard/revenue-impact-panel'
import { TodayAppointments } from '@/components/dashboard/today-appointments'
import { WhatsappStatusCard } from '@/components/dashboard/whatsapp-status-card'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PlanUpgradePrompt } from '@/components/dashboard/plan-upgrade-prompt'
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel'
import { MorningIntelligenceCard } from '@/components/dashboard/morning-intelligence'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
import { getGreeting } from '@/lib/utils/format-date'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { PageHeader } from '@/components/dashboard/PageStructure'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || 'Doctor'

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="mb-2">
          <PageHeader
            breadcrumb={<Breadcrumbs />}
            title={getGreeting(userName)}
            description="Here's your real-time patient flow, booking performance, and no-show risk for today."
            actions={(
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-accent/20 hover:bg-accent/10 hover:text-accent"
                >
                  <Link href="/patients/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Patient
                  </Link>
                </Button>
                <TwentyOneButton asChild>
                  <Link href="/appointments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                  </Link>
                </TwentyOneButton>
              </>
            )}
          />
        </div>

        {/* ── MORNING INTELLIGENCE (NEW) ────────────────────────── */}
        <div>
           <MorningIntelligenceCard 
              userName={userName} 
              recoveredRevenue={12500} 
              newLeads={3} 
              growth={12.5}
           />
        </div>

        {/* Alerts */}
        <div>
          <PlanUpgradePrompt />
        </div>

        <div>
          <WhatsappStatusCard />
        </div>

        {/* Revenue Impact */}
        <div>
          <RevenueImpactPanel />
        </div>

        <div>
          <ConversionFunnel />
        </div>

        {/* Stats Row */}
        <div>
          <StatsCards />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
          {/* Left Column (Timeline) - 4 cols wide */}
          <div className="col-span-1 space-y-6 lg:col-span-4">
            <TodayAppointments />
            <RecentActivity />
          </div>

          {/* Right Column (Insights/Quick Actions) - 3 cols wide */}
          <div className="col-span-1 space-y-6 lg:col-span-3">
            <QuickActions />
            <UpcomingAppointments />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
