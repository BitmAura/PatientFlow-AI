import * as React from 'react'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ServiceCard } from './service-card'
import { useReorderServices } from '@/hooks/use-services'

interface ServiceGridProps {
  services: any[]
  onEdit: (service: any) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, current: boolean) => void
}

export function ServiceGrid({ services, onEdit, onDelete, onToggleActive }: ServiceGridProps) {
  const reorder = useReorderServices()
  const [items, setItems] = React.useState(services)

  React.useEffect(() => {
    setItems(services)
  }, [services])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Optimistic update
        const orders = newItems.map((item, index) => ({
          id: item.id,
          order: index + 1
        }))
        reorder.mutate(orders)
        
        return newItems
      })
    }
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
        <p className="text-muted-foreground">No services found. Add your first service to get started.</p>
      </div>
    )
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(s => s.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
