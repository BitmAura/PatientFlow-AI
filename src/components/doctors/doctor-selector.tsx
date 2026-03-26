"use client"

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useDoctors } from '@/hooks/use-doctors'
import { Skeleton } from '@/components/ui/skeleton'

interface DoctorSelectorProps {
  value?: string
  onSelect: (doctorId: string | undefined) => void
  serviceId?: string
  className?: string
  showAnyOption?: boolean
}

export function DoctorSelector({ value, onSelect, serviceId, className, showAnyOption = true }: DoctorSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: doctors, isLoading } = useDoctors()

  // Filter doctors by service if provided
  const filteredDoctors = React.useMemo(() => {
    if (!doctors) return []
    if (!serviceId) return doctors
    return doctors.filter((d: any) => 
      d.services?.some((s: any) => s.service_id === serviceId)
    )
  }, [doctors, serviceId])

  const selectedDoctor = doctors?.find((d: any) => d.id === value)

  if (isLoading) return <Skeleton className="h-10 w-full" />
  
  // If only one doctor, maybe auto-select? Or just show single. 
  // If no doctors available for service, show warning?
  
  if (filteredDoctors.length === 0 && serviceId) {
      return <div className="text-sm text-muted-foreground italic p-2 border rounded-md">No doctors available for this service.</div>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto py-2", className)}
        >
          {selectedDoctor ? (
            <div className="flex items-center gap-2 text-left">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedDoctor.avatar_url} />
                <AvatarFallback>{selectedDoctor.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{selectedDoctor.name}</span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{value === 'any' ? "Any Available Doctor" : "Select Doctor"}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search doctor..." />
          <CommandList>
            <CommandEmpty>No doctor found.</CommandEmpty>
            <CommandGroup>
              {showAnyOption && (
                  <CommandItem
                    value="any"
                    onSelect={() => {
                        onSelect(undefined) // undefined means 'any' in our logic usually, or explicit 'any' string
                        setOpen(false)
                    }}
                  >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    Any Available Doctor
                  </CommandItem>
              )}
              {filteredDoctors.map((doctor: any) => (
                <CommandItem
                  key={doctor.id}
                  value={doctor.name}
                  onSelect={() => {
                    onSelect(doctor.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === doctor.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={doctor.avatar_url} />
                        <AvatarFallback>{doctor.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">{doctor.specialization}</span>
                    </div>
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
