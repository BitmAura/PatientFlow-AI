'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FOLLOWUP_TYPES } from '@/constants/followup-types'
import { useCreateFollowup } from '@/hooks/use-followups'
import { useToast } from '@/hooks/use-toast'
import { usePatients } from '@/hooks/use-patients' // Assuming this exists
import { Loader2 } from 'lucide-react'

interface ScheduleFollowupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleFollowupDialog({ open, onOpenChange }: ScheduleFollowupDialogProps) {
  const { toast } = useToast()
  const create = useCreateFollowup()
  const [formData, setFormData] = React.useState({
    patient_id: '',
    type: '',
    due_date: '',
    message: ''
  })

  // Simple patient fetch for dropdown (in real app use async select/combobox)
  const { data: patients } = usePatients({ page: 1, limit: 100 })

  const handleTypeChange = (type: string) => {
    const config = FOLLOWUP_TYPES.find(t => t.id === type)
    setFormData(prev => ({
      ...prev,
      type,
      message: config?.defaultTemplate || ''
    }))
  }

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(formData as any)
      toast({ title: 'Follow-up Scheduled' })
      onOpenChange(false)
      setFormData({ patient_id: '', type: '', due_date: '', message: '' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select 
              value={formData.patient_id} 
              onValueChange={(val) => setFormData({ ...formData, patient_id: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.data?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FOLLOWUP_TYPES.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input 
              type="date" 
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="h-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || !formData.patient_id}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
