'use client'

import * as React from 'react'
import { CAMPAIGN_TYPES } from '@/constants/campaign-types'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface CampaignTypeSelectorProps {
  selectedType: string
  onSelect: (type: string) => void
}

export function CampaignTypeSelector({ selectedType, onSelect }: CampaignTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAMPAIGN_TYPES.map((type) => {
        const Icon = type.icon
        const isSelected = selectedType === type.id
        
        return (
          <Card 
            key={type.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-2",
              isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"
            )}
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className={cn("p-3 rounded-full", type.bg)}>
                <Icon className={cn("h-6 w-6", type.color)} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{type.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
