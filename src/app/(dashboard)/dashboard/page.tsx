'use client'

import { useAuth } from '@/hooks/use-auth'
import { PageContainer } from '@/components/layout/page-container'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TodayAppointments } from '@/components/dashboard/today-appointments'
import { WhatsappStatusCard } from '@/components/dashboard/whatsapp-status-card'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
import { getGreeting } from '@/lib/utils/format-date'
import { motion } from 'framer-motion'
import { GlowButton } from '@/components/ui/glow-button'

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
        <motion.div variants={item}>
          <Breadcrumbs />
        </motion.div>

        {/* Page Header */}
        <motion.div
          variants={item}
          className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {getGreeting(userName)}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s what&apos;s happening at your clinic today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-accent/20 hover:bg-accent/10 hover:text-accent"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
            <GlowButton>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </GlowButton>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={item}>
          <WhatsappStatusCard />
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
