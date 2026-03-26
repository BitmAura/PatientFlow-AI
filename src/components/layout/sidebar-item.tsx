'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SidebarItemProps {
  item: {
    title: string
    href: string
    icon: LucideIcon
    badge?: number
    items?: any[]
  }
}

export function SidebarItem({ item }: SidebarItemProps) {
  const pathname = usePathname()
  const { sidebarCollapsed } = useUIStore()
  const [isOpen, setIsOpen] = React.useState(false)
  
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const hasChildren = item.items && item.items.length > 0
  const Icon = item.icon

  // Auto-expand if child is active
  React.useEffect(() => {
    if (isActive && hasChildren) {
      setIsOpen(true)
    }
  }, [isActive, hasChildren])

  if (hasChildren && !sidebarCollapsed) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 pt-1 space-y-1">
          {item.items?.map((subItem) => (
            <Link
              key={subItem.href}
              href={subItem.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === subItem.href 
                  ? "bg-accent/50 text-accent-foreground" 
                  : "text-muted-foreground"
              )}
            >
              {subItem.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground group relative",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        sidebarCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!sidebarCollapsed && (
        <span className="flex-1 truncate">{item.title}</span>
      )}
      {!sidebarCollapsed && item.badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {item.badge}
        </span>
      )}
      
      {/* Tooltip for collapsed state */}
      {sidebarCollapsed && (
        <div className="absolute left-full ml-2 hidden rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block z-50 whitespace-nowrap">
          {item.title}
        </div>
      )}
    </Link>
  )
}
