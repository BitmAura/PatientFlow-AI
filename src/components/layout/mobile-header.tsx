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
    <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-white border-b z-40 px-4 flex items-center justify-between">
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
