'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { User, Settings, LogOut, CreditCard, HelpCircle, Shield } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const fullName: string = user.user_metadata?.full_name || ''
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? 'U').toUpperCase()

  const planLabel = user.user_metadata?.selectedPlan
    ? (user.user_metadata.selectedPlan as string).charAt(0).toUpperCase() +
      (user.user_metadata.selectedPlan as string).slice(1) + ' Plan'
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={fullName || user.email || ''} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" forceMount>
        {/* Identity */}
        <DropdownMenuLabel className="font-normal px-3 py-2.5">
          <div className="flex flex-col gap-0.5">
            {fullName && <p className="text-sm font-semibold leading-none">{fullName}</p>}
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {planLabel && (
              <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {planLabel}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/billing" className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing & Plan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/whatsapp" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              WhatsApp Setup
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings/doctors" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Doctors & Staff
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="mailto:support@patientflow.ai" className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Get Support
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
