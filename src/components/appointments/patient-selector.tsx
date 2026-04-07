'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { useClinicStore } from '@/stores/clinic-store'

interface PatientSelectorProps {
  value?: string
  onSelect: (patientId: string, patient: any) => void
  onCreateNew?: () => void
}

export function PatientSelector({ value, onSelect, onCreateNew }: PatientSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { clinic } = useClinicStore()
  const supabase = createClient() as any

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients-search', search, clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return []
      
      let query = supabase
        .from('patients')
        .select('id, full_name, phone, email')
        .eq('clinic_id', clinic.id)
        .limit(10)

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data } = await query
      return data || []
    },
    enabled: open && !!clinic?.id,
  })

  const selectedPatient = (patients as any[])?.find((p: any) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3"
        >
          {selectedPatient ? (
            <div className="flex items-center gap-2 text-left">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{selectedPatient.full_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedPatient.full_name}</div>
                <div className="text-xs text-muted-foreground">{selectedPatient.phone}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Select or search patient...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search by name or phone..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">No patient found.</p>
                <Button variant="outline" size="sm" onClick={onCreateNew}>
                  <User className="mr-2 h-3 w-3" />
                  Create New Patient
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Patients">
              {patients?.map((patient: any) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={(currentValue) => {
                    const found = (patients as any[])?.find((p: any) => p.id === currentValue)
                    onSelect(currentValue, found)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{patient.full_name}</span>
                    <span className="text-xs text-muted-foreground">{patient.phone}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
