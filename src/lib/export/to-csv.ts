// @ts-ignore
import Papa from 'papaparse'
import { ColumnDefinition } from './column-definitions'
import { format } from 'date-fns'

function formatValue(value: any, type?: string) {
  if (value === null || value === undefined) return ''
  
  switch (type) {
    case 'date':
      return value ? format(new Date(value), 'yyyy-MM-dd') : ''
    case 'time':
      return value ? format(new Date(value), 'HH:mm') : ''
    case 'currency':
      return typeof value === 'number' ? value.toFixed(2) : '0.00'
    default:
      return value
  }
}

export function exportToCSV(
  data: any[],
  columns: ColumnDefinition[],
  filename: string
): Blob {
  // Map data to match columns
  const csvData = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      row[col.label] = formatValue(item[col.key], col.format)
    })
    return row
  })

  const csv = Papa.unparse(csvData)
  
  // Add BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF'
  return new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
}
