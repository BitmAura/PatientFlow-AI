'use client'

import { useDraggable } from '@dnd-kit/core'
import { GlassCard } from '@/components/ui/glass-card'
import { Lead } from '@/types/leads'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Phone, Calendar, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
      data: { lead },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <GlassCard
        className={`group mb-3 cursor-grab p-3 transition-all hover:shadow-md active:cursor-grabbing ${
          isDragging
            ? 'rotate-2 scale-105 opacity-50 shadow-xl ring-2 ring-primary/50'
            : ''
        }`}
        hoverEffect={!isDragging}
      >
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h4
              className="max-w-[150px] truncate text-sm font-semibold"
              title={lead.full_name}
            >
              {lead.full_name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>

          {/* Prevent drag on interactive elements */}
          <div onPointerDown={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {lead.interest && (
          <div className="mb-3">
            <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {lead.interest}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {lead.phone && (
            <div className="flex items-center gap-1" title="Call">
              <Phone className="h-3 w-3" />
            </div>
          )}
          {lead.next_followup_at && (
            <div
              className="flex items-center gap-1 font-medium text-orange-600/80"
              title="Next Follow-up"
            >
              <Calendar className="h-3 w-3" />
              {new Date(lead.next_followup_at).toLocaleDateString()}
            </div>
          )}
          <div className="ml-auto">{lead.source.replace('_', ' ')}</div>
        </div>
      </GlassCard>
    </div>
  )
}
