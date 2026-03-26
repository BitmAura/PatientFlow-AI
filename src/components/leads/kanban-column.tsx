'use client'

import { useDroppable } from '@dnd-kit/core'
import { Lead } from '@/types/leads'
import { LeadCard } from './lead-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  leads: Lead[]
  color?: string
}

export function KanbanColumn({
  id,
  title,
  leads,
  color = 'bg-muted/50',
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div className="flex h-full min-h-[600px] w-full min-w-[280px] max-w-xs flex-col rounded-xl border border-border/50 bg-muted/20">
      {/* Column Header */}
      <div
        className={cn(
          'sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-border/50 bg-background/80 p-4 backdrop-blur-sm',
          color
        )}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {title}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/50 text-xs font-medium text-foreground/70 shadow-sm">
            {leads.length}
          </span>
        </h3>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 flex-1 overflow-y-auto p-3 transition-colors duration-200',
          isOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : ''
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border/50 text-xs italic text-muted-foreground/50">
            Drop items here
          </div>
        )}
      </div>
    </div>
  )
}
