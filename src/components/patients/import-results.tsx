'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ImportResultsProps {
  results: {
    total: number
    success: number
    failed: number
    skipped: number
    errors: any[]
  }
}

export function ImportResults({ results }: ImportResultsProps) {
  const router = useRouter()

  const downloadErrors = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Row Data,Error\n"
      + results.errors.map(e => `"${JSON.stringify(e.row).replace(/"/g, '""')}","${e.error}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "import_errors.csv")
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-800">Import Complete</h3>
            <p className="text-green-700">
              Successfully processed {results.total} rows.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{results.success}</div>
            <p className="text-sm text-muted-foreground">Imported</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{results.skipped}</div>
            <p className="text-sm text-muted-foreground">Skipped (Duplicates)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-600">{results.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {results.failed > 0 && (
        <Card className="border-red-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{results.failed} rows failed to import</p>
                <p className="text-sm text-red-700">Download the error report to fix issues.</p>
              </div>
            </div>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={downloadErrors}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Import More
        </Button>
        <Button onClick={() => router.push('/patients')}>
          Go to Patients
        </Button>
      </div>
    </div>
  )
}
