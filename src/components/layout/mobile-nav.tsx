'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui-store'
import { SidebarItem } from './sidebar-item'
import { MAIN_NAV, COMMUNICATION_NAV, INSIGHTS_NAV, SETTINGS_NAV } from '@/constants/navigation'
import { usePathname } from 'next/navigation'
import { useClinicStore } from '@/stores/clinic-store'

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()
  const pathname = usePathname()
  const { clinic } = useClinicStore()

  // Close mobile nav when route changes
  React.useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname, setMobileNavOpen])

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle className="flex items-center gap-2 font-bold text-xl text-primary">
            PatientFlow AI
          </SheetTitle>
          {clinic && (
            <p className="text-sm text-muted-foreground">{clinic.name}</p>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2 scrollbar-thin h-[calc(100vh-80px)]">
          <NavGroup title="Main" items={MAIN_NAV} />
          <NavGroup title="Communication" items={COMMUNICATION_NAV} />
          <NavGroup title="Insights" items={INSIGHTS_NAV} />
          <NavGroup title="Configuration" items={SETTINGS_NAV} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NavGroup({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="space-y-1">
      <h4 className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
        {title}
      </h4>
      {items.map((item) => (
        <SidebarItem key={item.href} item={item} />
      ))}
    </div>
  )
}
