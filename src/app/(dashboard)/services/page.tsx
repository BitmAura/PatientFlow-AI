'use client'

import * as React from 'react'
import { useServices, useCreateService, useUpdateService, useDeleteService, useReorderServices } from '@/hooks/use-services'
import { ServiceGrid } from '@/components/services/service-grid'
import { ServiceFormDialog } from '@/components/services/service-form-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CreateServiceValues } from '@/lib/validations/service'

export default function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<any>(null)
  
  const { data: services, isLoading } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()
  const { toast } = useToast()

  const handleCreate = async (data: CreateServiceValues) => {
    try {
      await createService.mutateAsync(data)
      toast({ title: 'Success', description: 'Service created successfully' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create service' })
    }
  }

  const handleUpdate = async (data: CreateServiceValues) => {
    if (!editingService) return
    try {
      await updateService.mutateAsync({ id: editingService.id, data })
      toast({ title: 'Success', description: 'Service updated successfully' })
      setEditingService(null)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update service' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await deleteService.mutateAsync(id)
      toast({ title: 'Success', description: 'Service deleted' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete service' })
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    // We can reuse updateService but we need full data. 
    // Ideally we should have a patch endpoint or fetch service first.
    // For now, let's find it in local data
    const service = services?.find((s: any) => s.id === id)
    if (!service) return

    try {
      await updateService.mutateAsync({ 
        id, 
        data: { ...service, is_active: !current } 
      })
      toast({ title: 'Success', description: `Service ${!current ? 'activated' : 'deactivated'}` })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage your appointment types and pricing.
          </p>
        </div>
        <Button onClick={() => { setEditingService(null); setIsDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ServiceGrid 
          services={services || []} 
          onEdit={(s) => { setEditingService(s); setIsDialogOpen(true) }}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <ServiceFormDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingService(null)
        }}
        initialData={editingService}
        onSubmit={editingService ? handleUpdate : handleCreate}
      />
    </div>
  )
}
