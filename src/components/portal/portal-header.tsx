'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { usePortalLogout } from '@/hooks/use-portal-auth'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export function PortalHeader() {
  const logout = usePortalLogout()
  // In real app, verify session on server or client to show/hide logout
  // For MVP, we assume if this component is rendered in protected layout/page, show logout

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/portal" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            PF
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">PatientFlow AI Portal</span>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => logout.mutate()}
          className="text-muted-foreground hover:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}
