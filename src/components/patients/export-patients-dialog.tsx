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
import { PATIENT_COLUMNS } from '@/lib/export/column-definitions'
import { useExportPatients } from '@/hooks/use-export'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ExportPatientsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportPatientsDialog({ open, onOpenChange }: ExportPatientsDialogProps) {
  const [columns, setColumns] = React.useState<string[]>(PATIENT_COLUMNS.map(c => c.key))
  const [format, setFormat] = React.useState<'excel' | 'csv' | 'pdf'>('excel')
  
  const exportMutation = useExportPatients()
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
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
          <DialogTitle>Export Patients</DialogTitle>
          <DialogDescription>
            Download your patient database.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
              {PATIENT_COLUMNS.map((col) => (
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
