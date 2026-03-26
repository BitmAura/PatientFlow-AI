'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImportDropzone } from '@/components/patients/import-dropzone'
import { ImportColumnMapping } from '@/components/patients/import-column-mapping'
import { ImportResults } from '@/components/patients/import-results'
import { validateImportData, ValidationResult } from '@/lib/import/validate-data'
import { useImportPatients } from '@/hooks/use-patient-import'
import { ArrowLeft, ArrowRight, Download, AlertTriangle } from 'lucide-react'
import { generateExcelTemplate, generateCSVTemplate } from '@/lib/import/sample-templates'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const STEPS = ['Upload', 'Map Columns', 'Options', 'Results']

export default function ImportPatientsPage() {
  const [step, setStep] = React.useState(0)
  const [fileData, setFileData] = React.useState<any[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [mappings, setMappings] = React.useState<Record<string, string>>({})
  const [validationResults, setValidationResults] = React.useState<ValidationResult[]>([])
  const [importOptions, setImportOptions] = React.useState({
    duplicate_handling: 'skip',
    requires_deposit: false,
  })
  
  const importMutation = useImportPatients()

  const handleFileSelect = (file: File, data: any[]) => {
    setFileData(data)
    // Extract headers from first row keys
    if (data.length > 0) {
      setHeaders(Object.keys(data[0]))
    }
    setStep(1)
  }

  const handleMappingConfirm = () => {
    const results = validateImportData(fileData, mappings)
    setValidationResults(results)
    setStep(2)
  }

  const handleImport = async () => {
    try {
      await importMutation.mutateAsync({
        data: validationResults.filter(r => r.isValid),
        options: importOptions
      })
      setStep(3)
    } catch (error) {
      console.error(error)
    }
  }

  const downloadTemplate = (type: 'excel' | 'csv') => {
    const blob = type === 'excel' ? generateExcelTemplate() : generateCSVTemplate()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `patient_import_template.${type === 'excel' ? 'xlsx' : 'csv'}`
    link.click()
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Import Patients</h1>
          {step === 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                <Download className="mr-2 h-4 w-4" /> CSV Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('excel')}>
                <Download className="mr-2 h-4 w-4" /> Excel Template
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 
                  ${step === i ? 'border-primary text-primary' : 
                    step > i ? 'bg-primary border-primary text-primary-foreground' : 
                    'border-muted text-muted-foreground'}`}
              >
                {i + 1}
              </div>
              <span className={`ml-2 text-sm ${step === i ? 'font-medium' : 'text-muted-foreground'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-12 h-0.5 bg-muted mx-4" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 0 && (
          <ImportDropzone onFileSelect={handleFileSelect} />
        )}

        {/* Step 2: Mapping */}
        {step === 1 && (
          <div className="space-y-6">
            <ImportColumnMapping 
              headers={headers}
              sampleData={fileData.slice(0, 3)}
              mappings={mappings}
              onMappingChange={setMappings}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleMappingConfirm}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Options & Review */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Duplicate Handling</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    What should happen if a patient with the same phone number already exists?
                  </p>
                  <RadioGroup 
                    value={importOptions.duplicate_handling} 
                    onValueChange={(val) => setImportOptions(prev => ({ ...prev, duplicate_handling: val }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip">Skip (Don&apos;t import)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="update" id="update" />
                      <Label htmlFor="update">Update existing record</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Review Summary</Label>
                    <div className="text-sm text-muted-foreground">
                      Total Rows: {validationResults.length}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Valid: {validationResults.filter(r => r.isValid).length}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Invalid: {validationResults.filter(r => !r.isValid).length}
                    </div>
                  </div>
                  {validationResults.some(r => !r.isValid) && (
                    <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Invalid rows will be skipped
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importMutation.isPending || validationResults.filter(r => r.isValid).length === 0}
              >
                {importMutation.isPending ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 3 && importMutation.data && (
          <ImportResults results={importMutation.data} />
        )}
      </div>
    </PageContainer>
  )
}
