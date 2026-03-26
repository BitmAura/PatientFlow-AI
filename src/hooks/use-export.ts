import { useMutation } from '@tanstack/react-query'
import { ColumnDefinition } from '@/lib/export/column-definitions'

interface ExportOptions {
  date_from?: string
  date_to?: string
  status?: string
  columns: string[]
  format: 'excel' | 'csv' | 'pdf'
}

interface ExportReportOptions extends ExportOptions {
  report_type?: string // Optional if we use it for generic export
}

async function downloadFile(response: Response, filename: string) {
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export function useExportAppointments() {
  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const res = await fetch('/api/export/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })
      if (!res.ok) throw new Error('Export failed')
      
      const filename = `appointments.${options.format === 'excel' ? 'xlsx' : options.format}`
      await downloadFile(res, filename)
    }
  })
}

export function useExportPatients() {
  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const res = await fetch('/api/export/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })
      if (!res.ok) throw new Error('Export failed')
      
      const filename = `patients.${options.format === 'excel' ? 'xlsx' : options.format}`
      await downloadFile(res, filename)
    }
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (options: ExportReportOptions) => {
      const res = await fetch('/api/export/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: 'summary', // Default or passed from options if extended
          date_from: options.date_from,
          date_to: options.date_to,
          format: options.format
        })
      })
      if (!res.ok) throw new Error('Export failed')
      
      const filename = `report.${options.format}`
      await downloadFile(res, filename)
    }
  })
}
