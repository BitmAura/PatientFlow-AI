'use client'

import React from 'react'
import { useUser, UserRole } from '@/hooks/use-user'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  showFallback?: boolean
  message?: string
}

/**
 * RoleGuard
 * 🏥 Purpose: Enforce frontend RBAC.
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  showFallback = true,
  message = "You don't have permission to access this feature."
}: RoleGuardProps) {
  const { role, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isAllowed = role && allowedRoles.includes(role)

  if (!isAllowed) {
    if (!showFallback) return null

    return (
      <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription className="text-xs">
          {message} Please contact your clinic administrator.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
