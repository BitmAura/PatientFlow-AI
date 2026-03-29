import * as XLSX from 'xlsx'

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
      rows.push({ section: key, value: JSON.stringify(value) })
    } else {
      rows.push({ metric: key, value })
    }
  }

  return rows
}

export async function exportToExcel(data: any[], filename: string): Promise<Blob> {
  const rows = normalizeRows(data)
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Export')

  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function generateReportExcel(reportType: string, data: any, dateRange: any): Promise<Blob> {
  const rows = normalizeRows(data)
  const workbook = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Report Type', reportType],
    ['From', dateRange?.from ? new Date(dateRange.from).toISOString() : '-'],
    ['To', dateRange?.to ? new Date(dateRange.to).toISOString() : '-'],
    ['Generated At', new Date().toISOString()],
  ])
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const dataSheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data')

  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}