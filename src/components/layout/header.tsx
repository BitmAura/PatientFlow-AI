'use client'

import * as React from 'react'
import { Bell, Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu } from './user-menu'
import { useUIStore } from '@/stores/ui-store'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { cn } from '@/lib/utils/cn'

export function Header() {
  const { toggleMobileNav, toggleSidebarCollapse } = useUIStore()
  const { data: whatsappStatus } = useWhatsApp()
  
  const isConnected = whatsappStatus?.status === 'connected' || whatsappStatus?.status === 'active'

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileNav}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="hidden md:flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients, appointments..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* WhatsApp Status Indicator */}
        <div 
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border",
            isConnected 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          <span className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-amber-500 animate-pulse"
          )} />
          <span className="hidden sm:inline">
            {isConnected ? 'WhatsApp Connected' : 'Connect WhatsApp'}
          </span>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
        </Button>

        <UserMenu />
      </div>
    </header>
  )
}
