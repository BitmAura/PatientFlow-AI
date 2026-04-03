'use client'

import * as React from 'react'
import { Building2, Check, ChevronDown, Plus, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Location = {
  id: string
  name: string
  address?: string | null
  city?: string | null
  is_primary: boolean
}

type LocationSwitcherProps = {
  clinicName: string
  planId: string
  maxLocations: number
}

export function LocationSwitcher({ clinicName, planId, maxLocations }: LocationSwitcherProps) {
  const [locations, setLocations] = React.useState<Location[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [addOpen, setAddOpen] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [newCity, setNewCity] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/clinics/locations')
      .then(r => r.json())
      .then(d => {
        const locs: Location[] = d.locations ?? []
        setLocations(locs)
        // Default to primary
        const primary = locs.find(l => l.is_primary)
        setActiveId(primary?.id ?? locs[0]?.id ?? null)
      })
      .catch(() => {})
  }, [])

  const active = locations.find(l => l.id === activeId)
  const canAddMore = maxLocations === -1 || locations.length < maxLocations

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/clinics/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), city: newCity.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to add location')
      } else {
        setLocations(prev => [...prev, data.location])
        setActiveId(data.location.id)
        setAddOpen(false)
        setNewName('')
        setNewCity('')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // If only one location, just show static name (no switcher chrome needed)
  if (locations.length <= 1 && !canAddMore) {
    return (
      <div className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{active?.city ?? active?.name ?? clinicName}</span>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between h-8 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{active?.name ?? clinicName}</span>
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Switch location
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locations.map(loc => (
            <DropdownMenuItem
              key={loc.id}
              onSelect={() => setActiveId(loc.id)}
              className="flex items-center gap-2"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 truncate">{loc.name}</span>
              {loc.id === activeId && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
          {canAddMore && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setAddOpen(true)}
                className="text-primary"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Add location
              </DropdownMenuItem>
            </>
          )}
          {!canAddMore && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Upgrade to add more locations
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add new location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="loc-name">Branch name <span className="text-red-500">*</span></Label>
              <Input
                id="loc-name"
                placeholder="e.g. Koramangala Branch"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-city">City <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="loc-city"
                placeholder="e.g. Bangalore"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !newName.trim()}>
              {saving ? 'Adding…' : 'Add location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
