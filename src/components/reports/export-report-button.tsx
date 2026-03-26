'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Loader2, FileSpreadsheet, FileText } from 'lucide-react'
import { generateReportPDF } from '@/lib/export/to-pdf'
import { generateReportExcel } from '@/lib/export/to-excel'
import { DateRange } from '@/lib/services/stats'
import { useToast } from '@/hooks/use-toast'

interface ExportReportButtonProps {
  reportType: string // 'Overview' | 'No-Shows' | 'Appointments' | 'Revenue'
  data: any
  dateRange: DateRange | undefined
}

export function ExportReportButton({ reportType, data, dateRange }: ExportReportButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!data || !dateRange || !dateRange.from || !dateRange.to) {
      toast({ variant: 'destructive', title: 'Error', description: 'No data to export' })
      return
    }

    setLoading(true)
    try {
      let blob: Blob
      
      if (format === 'pdf') {
        blob = await generateReportPDF(reportType, data, dateRange as DateRange)
      } else {
        blob = await generateReportExcel(reportType, data, dateRange as DateRange)
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({ title: 'Export Successful', description: `Downloaded ${reportType} report` })
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Please try again' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
