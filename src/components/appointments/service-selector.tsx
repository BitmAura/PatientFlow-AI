'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { useClinicStore } from '@/stores/clinic-store'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ServiceSelectorProps {
  value?: string
  onSelect: (serviceId: string) => void
}

export function ServiceSelector({ value, onSelect }: ServiceSelectorProps) {
  const { clinic } = useClinicStore()
  const supabase = createClient() as any

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return []
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      return data || []
    },
    enabled: !!clinic?.id,
  })

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services?.map((service: any) => (
        <Card
          key={service.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            value === service.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
          )}
          onClick={() => onSelect(service.id)}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{service.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.duration} min
                </span>
                <span>•</span>
                <span>{formatCurrency(service.price)}</span>
              </div>
            </div>
            <div 
              className={cn(
                "h-4 w-4 rounded-full border border-primary",
                value === service.id ? "bg-primary" : "bg-transparent"
              )} 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
