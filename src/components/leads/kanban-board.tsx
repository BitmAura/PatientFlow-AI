'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core'
import { KanbanColumn } from './kanban-column'
import { LeadCard } from './lead-card'
import { Lead, LeadStatus } from '@/types/leads'
import { updateLeadStatus } from '@/lib/actions/leads'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface KanbanBoardProps {
  initialLeads: Lead[]
  clinicId: string
}

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-500/10' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500/10' },
  { id: 'responsive', title: 'Responsive', color: 'bg-orange-500/10' },
  { id: 'booked', title: 'Booked', color: 'bg-green-500/10' },
  { id: 'lost', title: 'Lost', color: 'bg-red-500/10' },
  { id: 'invalid', title: 'Invalid', color: 'bg-slate-500/10' },
]

export function KanbanBoard({ initialLeads, clinicId }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const lead = leads.find((l) => l.id === active.id)
    if (lead) setActiveLead(lead)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus
    const lead = leads.find((l) => l.id === leadId)

    if (!lead || lead.status === newStatus) return

    // Optimistic Update
    const oldStatus = lead.status
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    )

    try {
      await updateLeadStatus(leadId, newStatus, clinicId)
      toast.success(`Lead moved to ${newStatus}`)
    } catch (error) {
      // Revert on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: oldStatus } : l))
      )
      toast.error('Failed to update status')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-220px)] snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="h-full snap-center">
            <KanbanColumn
              id={col.id}
              title={col.title}
              leads={leads.filter((l) => l.status === col.id)}
              color={col.color}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-[280px] rotate-2 cursor-grabbing">
            <LeadCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
