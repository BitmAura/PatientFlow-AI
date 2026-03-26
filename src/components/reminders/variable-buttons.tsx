'use client'

import * as React from 'react'
import { TEMPLATE_VARIABLES } from '@/lib/whatsapp/templates'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus } from 'lucide-react'

interface VariableButtonsProps {
  onInsert: (variable: string) => void
}

export function VariableButtons({ onInsert }: VariableButtonsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_VARIABLES.map((variable) => (
          <Tooltip key={variable.key}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-muted/50 border-dashed"
                onClick={() => onInsert(`{{${variable.key}}}`)}
              >
                <Plus className="mr-1 h-3 w-3" />
                {variable.key}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-xs">{variable.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Ex: {variable.example}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
