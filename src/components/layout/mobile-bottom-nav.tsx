'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, Calendar, Users, Inbox, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useInboxUnreadCount } from '@/hooks/use-inbox'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = React.useState(true)
  const lastScrollY = React.useRef(0)
  const { data: inboxUnread = 0 } = useInboxUnreadCount()

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard', badge: 0 },
    { icon: Calendar, label: 'Bookings', href: '/appointments', badge: 0 },
    { icon: Users, label: 'Patients', href: '/patients', badge: 0 },
    { icon: Inbox, label: 'Inbox', href: '/inbox', badge: inboxUnread },
    { icon: MoreHorizontal, label: 'More', href: '/settings', badge: 0 },
  ]

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 border-t border-border/70 bg-background/95 backdrop-blur-md z-40 transition-transform duration-300 pb-safe",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                {item.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
