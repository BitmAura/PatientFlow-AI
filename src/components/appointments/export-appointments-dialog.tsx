import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { APPOINTMENT_COLUMNS } from '@/lib/export/column-definitions'
import { useExportAppointments } from '@/hooks/use-export'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ExportAppointmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportAppointmentsDialog({ open, onOpenChange }: ExportAppointmentsDialogProps) {
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [columns, setColumns] = React.useState<string[]>(APPOINTMENT_COLUMNS.map(c => c.key))
  const [format, setFormat] = React.useState<'excel' | 'csv' | 'pdf'>('excel')
  
  const exportMutation = useExportAppointments()
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status,
        columns,
        format
      })
      toast({ title: 'Export Successful', description: 'Your file has been downloaded.' })
      onOpenChange(false)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate file.' })
    }
  }

  const toggleColumn = (key: string) => {
    setColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Appointments</DialogTitle>
          <DialogDescription>
            Select criteria and format for your export.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Include Columns</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
              {APPOINTMENT_COLUMNS.map((col) => (
                <div key={col.key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={col.key} 
                    checked={columns.includes(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <label htmlFor={col.key} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
