'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Menu, Bell } from 'lucide-react'
import { NotificationsDropdown } from '@/components/layout/notifications-dropdown'
import { UserMenu } from '@/components/layout/user-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/sidebar'
import { usePathname } from 'next/navigation'

export function MobileHeader() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close sidebar on navigation
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            PF
          </div>
          <span className="font-semibold text-lg">PatientFlow AI</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  )
}
