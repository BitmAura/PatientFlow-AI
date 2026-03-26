import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { MoreVertical, GripVertical, Pencil, Trash2, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils/cn'

interface ServiceCardProps {
  service: any
  onEdit: (service: any) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, current: boolean) => void
}

export function ServiceCard({ service, onEdit, onDelete, onToggleActive }: ServiceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Card ref={setNodeRef} style={style} className={cn("group", isDragging && "shadow-lg")}>
      <CardContent className="p-4 flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div 
          className="w-4 h-4 rounded-full shrink-0" 
          style={{ backgroundColor: service.color }} 
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{service.name}</h3>
            {!service.is_active && (
              <Badge variant="outline" className="text-xs">Inactive</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{service.duration_minutes}m</span>
            </div>
            <span>•</span>
            <span>{service.price > 0 ? formatCurrency(service.price) : 'Free'}</span>
            {service.deposit_required && (
               <>
                <span>•</span>
                <span className="text-orange-600 text-xs font-medium">
                  {formatCurrency(service.deposit_amount)} Deposit
                </span>
               </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Switch 
            checked={service.is_active} 
            onCheckedChange={() => onToggleActive(service.id, service.is_active)}
            onClick={(e) => e.stopPropagation()}
           />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(service.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
