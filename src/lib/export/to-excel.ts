import ExcelJS from 'exceljs'

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
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Export')

  if (rows.length > 0) {
    const keys = Object.keys(rows[0])
    worksheet.columns = keys.map((k) => ({ header: k, key: k }))
    rows.forEach((r) => worksheet.addRow(r))
  } else {
    worksheet.addRow({ value: '' })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function generateReportExcel(reportType: string, data: any, dateRange: any): Promise<Blob> {
  const rows = normalizeRows(data)
  const workbook = new ExcelJS.Workbook()

  const summarySheet = workbook.addWorksheet('Summary')
  summarySheet.addRows([
    ['Report Type', reportType],
    ['From', dateRange?.from ? new Date(dateRange.from).toISOString() : '-'],
    ['To', dateRange?.to ? new Date(dateRange.to).toISOString() : '-'],
    ['Generated At', new Date().toISOString()],
  ])

  const dataSheet = workbook.addWorksheet('Data')
  if (rows.length > 0) {
    const keys = Object.keys(rows[0])
    dataSheet.columns = keys.map((k) => ({ header: k, key: k }))
    rows.forEach((r) => dataSheet.addRow(r))
  } else {
    dataSheet.addRow({ value: '' })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}