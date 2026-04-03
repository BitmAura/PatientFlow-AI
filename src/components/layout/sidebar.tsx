'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'
import { useClinicStore } from '@/stores/clinic-store'
import { SidebarItem } from './sidebar-item'
import { LocationSwitcher } from './location-switcher'
import { MAIN_NAV, COMMUNICATION_NAV, INSIGHTS_NAV, SETTINGS_NAV } from '@/constants/navigation'
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PRICING_PLANS, normalizePlanId } from '@/lib/billing/plans'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
  const { clinic, subscription } = useClinicStore()
  const normalizedPlan = normalizePlanId(subscription.plan)
  const planConfig = PRICING_PLANS[normalizedPlan]

  // On mobile/tablet, sidebar is always "expanded" visually when inside the sheet
  // But we use the store state for desktop behavior
  // For this component, if className contains mobile styles, we might want to force expand?
  // Or just rely on the sheet container to handle width.
  // Actually, inside the Sheet, we want full width usually.
  
  // To handle the "Sheet" context, we can just ignore `sidebarCollapsed` if we are in mobile mode
  // But `sidebarCollapsed` is global state. 
  // Let's assume on mobile we just render full width content and ignore collapse state for layout purposes,
  // or the parent controls the container width.

  return (
    <aside
      className={cn(
        "bg-background transition-all duration-300 flex flex-col h-full",
        // Desktop styles (when not in sheet)
        !className && "fixed left-0 top-0 z-40 h-screen border-r",
        !className && (sidebarCollapsed ? "w-16" : "w-64"),
        // Custom classes (e.g. from Sheet)
        className
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center border-b px-4 justify-between shrink-0">
        {(!sidebarCollapsed || className) && (
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-2xl text-primary truncate">
             <div className="relative w-12 h-12">
               <Image 
                 src="/logo.png" 
                 alt="PatientFlow AI" 
                 fill
                 className="object-contain"
               />
             </div>
            <span>PatientFlow AI</span>
          </Link>
        )}
        {sidebarCollapsed && !className && (
          <div className="mx-auto">
             <div className="relative w-10 h-10">
               <Image 
                 src="/logo.png" 
                 alt="PatientFlow AI" 
                 fill
                 className="object-contain"
               />
             </div>
          </div>
        )}
        
        {!className && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("hidden lg:flex h-6 w-6", sidebarCollapsed && "mx-auto")}
            onClick={toggleSidebarCollapse}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Clinic Info + Location Switcher */}
      {(!sidebarCollapsed || className) && clinic && (
        <div className="px-3 py-3 border-b shrink-0 space-y-1.5">
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {clinic.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium truncate text-sm">{clinic.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              </p>
            </div>
          </div>
          <LocationSwitcher
            clinicName={clinic.name}
            planId={normalizedPlan}
            maxLocations={planConfig.maxLocations}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2 scrollbar-thin">
        <NavGroup title="Main" items={MAIN_NAV} collapsed={sidebarCollapsed && !className} />
        <NavGroup title="Communication" items={COMMUNICATION_NAV} collapsed={sidebarCollapsed && !className} />
        <NavGroup title="Insights" items={INSIGHTS_NAV} collapsed={sidebarCollapsed && !className} />
        <NavGroup title="Configuration" items={SETTINGS_NAV} collapsed={sidebarCollapsed && !className} />
      </div>

      {/* Subscription Status */}
      {(!sidebarCollapsed || className) && (
        <div className="p-4 border-t bg-muted/20 shrink-0">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Pro Plan</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Appointments</span>
                <span>{subscription.usage.appointments} / {subscription.usage.limit}</span>
              </div>
              <Progress 
                value={(subscription.usage.appointments / subscription.usage.limit) * 100} 
                className="h-1.5"
              />
              <Button size="sm" variant="outline" className="w-full text-xs h-7">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function NavGroup({ title, items, collapsed }: { title: string, items: any[], collapsed: boolean }) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <h4 className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <SidebarItem key={item.href} item={item} />
      ))}
    </div>
  )
}
