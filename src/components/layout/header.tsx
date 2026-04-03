'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu } from './user-menu'
import { LanguageSwitcher } from './language-switcher'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

export function Header() {
  const { data: whatsappStatus } = useWhatsApp()
  const router = useRouter()
  const isConnected = whatsappStatus?.status === 'connected' || whatsappStatus?.connected === true

  /* ── keyboard shortcut: Ctrl/Cmd + K focuses search ── */
  const searchRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 supports-[backdrop-filter]:bg-background/80">

      {/* Left: Search */}
      <div className="hidden flex-1 md:flex md:max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="search"
            placeholder="Search patients, appointments…"
            className="w-full bg-muted/30 pl-9 pr-14 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="ml-auto flex items-center gap-3">

        {/* WhatsApp status pill — clickable link to settings */}
        <Link
          href="/settings/whatsapp"
          className={cn(
            'hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80',
            isConnected
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400'
              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400'
          )}
          title={isConnected ? 'WhatsApp connected — click to manage' : 'WhatsApp not connected — click to set up'}
        >
          <span className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
          )} />
          {isConnected ? 'WhatsApp Active' : 'Connect WhatsApp'}
        </Link>

        {/* Notification bell */}
        <NotificationBell />

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* User avatar menu */}
        <UserMenu />
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Notification bell with real unread count from API
───────────────────────────────────────────────────────────────── */
function NotificationBell() {
  const router = useRouter()
  const [unread, setUnread] = React.useState<number>(0)

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/notifications?unread_only=true&limit=1', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setUnread(d?.unread_count ?? d?.total ?? 0)
      })
      .catch(() => {/* silently ignore */})
    return () => { cancelled = true }
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push('/notifications')}
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
    >
      <Bell className="h-5 w-5 text-muted-foreground" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Button>
  )
}
