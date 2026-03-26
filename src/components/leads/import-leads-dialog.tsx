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
import { ImportDropzone } from '@/components/patients/import-dropzone'
import { ImportLeadColumnMapping } from './import-column-mapping'
import { ImportResults } from '@/components/patients/import-results'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface ImportLeadsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'upload' | 'map' | 'processing' | 'results'

export function ImportLeadsDialog({ open, onOpenChange }: ImportLeadsDialogProps) {
  const [step, setStep] = React.useState<Step>('upload')
  const [_file, setFile] = React.useState<File | null>(null)
  const [rawData, setRawData] = React.useState<any[]>([])
  const [mappings, setMappings] = React.useState<Record<string, string>>({})
  const [importResults, setImportResults] = React.useState<any>(null)
  
  // Options
  const [duplicateHandling, setDuplicateHandling] = React.useState('skip')

  const queryClient = useQueryClient()

  const reset = () => {
    setStep('upload')
    setFile(null)
    setRawData([])
    setMappings({})
    setImportResults(null)
  }

  const { mutate: importLeads, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Import failed')
      return response.json()
    },
    onSuccess: (results) => {
      setImportResults(results)
      setStep('results')
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success(`Processed ${results.total} leads`)
    },
    onError: () => {
      toast.error('Failed to import leads')
      setStep('map')
    }
  })

  const handleFileSelect = (file: File, data: any[]) => {
    setFile(file)
    setRawData(data)
    setStep('map')
  }

  const handleImport = () => {
    // Transform data based on mappings
    const transformedData = rawData.map(row => {
      const newRow: any = {}
      Object.entries(mappings).forEach(([field, header]) => {
        if (header) {
          newRow[field] = row[header]
        }
      })
      return { row: newRow } // Wrap in expected format
    })

    // Validate required fields
    if (!mappings['full_name']) {
      toast.error('Please map the Name column')
      return
    }

    setStep('processing')
    importLeads({
      data: transformedData,
      options: {
        duplicate_handling: duplicateHandling,
      }
    })
  }

  const headers = rawData.length > 0 ? Object.keys(rawData[0]) : []

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => {
      if (!val) reset()
      onOpenChange(val)
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Leads'}
            {step === 'map' && 'Map Columns'}
            {step === 'processing' && 'Importing Leads...'}
            {step === 'results' && 'Import Complete'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && (
            <div className="space-y-4">
              <ImportDropzone onFileSelect={handleFileSelect} />
              <div className="text-sm text-muted-foreground">
                <p>Supported formats: .csv, .xlsx, .xls</p>
                <p>Max file size: 5MB</p>
              </div>
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <Label>Duplicate Handling</Label>
                <RadioGroup value={duplicateHandling} onValueChange={setDuplicateHandling}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip">Skip duplicates (based on phone)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="update" id="update" />
                    <Label htmlFor="update">Update existing records</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="allow" id="allow" />
                    <Label htmlFor="allow">Create duplicates</Label>
                  </div>
                </RadioGroup>
              </div>

              <ImportLeadColumnMapping 
                headers={headers}
                sampleData={rawData.slice(0, 3)}
                mappings={mappings}
                onMappingChange={setMappings}
              />
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing your file...</p>
            </div>
          )}

          {step === 'results' && importResults && (
            <ImportResults 
              results={importResults} 
            />
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {step === 'map' ? (
            <>
              <Button variant="ghost" onClick={() => setStep('upload')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleImport} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Import Leads
              </Button>
            </>
          ) : step === 'results' ? (
            <Button onClick={() => onOpenChange(false)} className="ml-auto">
              Done
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
