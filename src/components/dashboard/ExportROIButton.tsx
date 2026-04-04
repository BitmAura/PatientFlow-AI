'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'
import { generateExecutiveROIReport } from '@/lib/reports/roi-report-generator'

interface ExportROIButtonProps {
  clinicName: string
  stats: {
    recoveredRevenue: number
    pipelineValue: number
    conversionRate: string
    totalLeads: number
  }
  leads: any[]
}

export function ExportROIButton({ clinicName, stats, leads }: ExportROIButtonProps) {
  const [loading, setLoading] = React.useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const reportBlob = await generateExecutiveROIReport(clinicName, stats, leads)
      const url = window.URL.createObjectURL(reportBlob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ROI-Report-${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleDownload} 
      disabled={loading}
      className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
    >
      <DownloadIcon className="h-4 w-4" />
      {loading ? 'Generating...' : 'Export ROI Report'}
    </Button>
  )
}
