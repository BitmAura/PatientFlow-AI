'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, Calendar, Users, MessageSquare, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = React.useState(true)
  const lastScrollY = React.useRef(0)

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
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: Calendar, label: 'Bookings', href: '/appointments' },
    { icon: Users, label: 'Patients', href: '/patients' },
    { icon: MessageSquare, label: 'Reminders', href: '/reminders' },
    { icon: MoreHorizontal, label: 'More', href: '/settings' },
  ]

  return (
    <div 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 transition-transform duration-300 pb-safe",
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
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
