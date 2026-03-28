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
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
import { getGreeting } from '@/lib/utils/format-date'
import { motion } from 'framer-motion'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { PageHeader } from '@/components/dashboard/PageStructure'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || 'Doctor'

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={item}
          className="mb-2"
        >
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
        </motion.div>

        {/* Alerts */}
        <motion.div variants={item}>
          <PlanUpgradePrompt />
        </motion.div>

        <motion.div variants={item}>
          <WhatsappStatusCard />
        </motion.div>

        {/* Revenue Impact */}
        <motion.div variants={item}>
          <RevenueImpactPanel />
        </motion.div>

        <motion.div variants={item}>
          <ConversionFunnel />
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={item}>
          <StatsCards />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
          {/* Left Column (Timeline) - 4 cols wide */}
          <motion.div
            variants={item}
            className="col-span-1 space-y-6 lg:col-span-4"
          >
            <TodayAppointments />
            <RecentActivity />
          </motion.div>

          {/* Right Column (Insights/Quick Actions) - 3 cols wide */}
          <motion.div
            variants={item}
            className="col-span-1 space-y-6 lg:col-span-3"
          >
            <QuickActions />
            <UpcomingAppointments />
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  )
}
