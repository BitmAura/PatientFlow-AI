'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ReminderToggleCardProps {
  title: string
  description: string
  icon: React.ElementType
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onEdit: () => void
}

export function ReminderToggleCard({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  onEdit
}: ReminderToggleCardProps) {
  return (
    <Card className={cn("transition-colors", enabled ? "border-primary/20 bg-primary/5" : "bg-muted/10")}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
          enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{title}</h3>
            {enabled && <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            disabled={!enabled}
            className="hidden sm:flex"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Template
          </Button>
          
          <Switch 
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>
      </CardContent>
    </Card>
  )
}
