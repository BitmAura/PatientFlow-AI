import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function normalizeRows(data: any): Array<Record<string, any>> {
  if (Array.isArray(data)) {
    return data.map((row) => (typeof row === 'object' && row !== null ? row : { value: row }))
  }

  if (!data || typeof data !== 'object') {
    return [{ value: data ?? '' }]
  }

  const rows: Array<Record<string, any>> = []
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ section: key, value: '' })
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        for (const item of value) {
          rows.push({ section: key, ...(item as Record<string, any>) })
        }
      } else {
        rows.push({ section: key, value: value.join(', ') })
      }
    } else if (value && typeof value === 'object') {
      rows.push({ metric: key, value: JSON.stringify(value) })
    } else {
      rows.push({ metric: key, value })
    }
  }

  return rows
}

export async function exportTableToPDF(data: any[], title: string): Promise<Blob> {
  const rows = normalizeRows(data)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  doc.setFontSize(14)
  doc.text(title, 40, 40)
  doc.setFontSize(10)
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 58)

  if (rows.length > 0) {
    const keys = Object.keys(rows[0])
    autoTable(doc, {
      startY: 72,
      head: [keys],
      body: rows.map((row) => keys.map((key) => stringifyValue(row[key]))),
      styles: { fontSize: 8 },
    })
  } else {
    doc.text('No data available', 40, 84)
  }

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
}

export async function generateReportPDF(reportType: string, data: any, dateRange: any): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  doc.setFontSize(16)
  doc.text(`${reportType} Report`, 40, 42)
  doc.setFontSize(10)
  doc.text(`From: ${dateRange?.from ? new Date(dateRange.from).toLocaleDateString() : '-'}`, 40, 62)
  doc.text(`To: ${dateRange?.to ? new Date(dateRange.to).toLocaleDateString() : '-'}`, 40, 78)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 94)

  const rows = normalizeRows(data)
  if (rows.length > 0) {
    const keys = Object.keys(rows[0])
    autoTable(doc, {
      startY: 110,
      head: [keys],
      body: rows.map((row) => keys.map((key) => stringifyValue(row[key]))),
      styles: { fontSize: 8 },
    })
  } else {
    doc.text('No data available for selected date range.', 40, 126)
  }

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
}