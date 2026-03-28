import { parseCSV } from '@/lib/import/parse-csv'

export async function parseExcel(file: File): Promise<any[]> {
  // Security hardening: xlsx parser removed due upstream vulnerabilities.
  // Keep this function for backward compatibility and parse only CSV.
  return parseCSV(file)
}
