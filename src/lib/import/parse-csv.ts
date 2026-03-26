// @ts-ignore
import Papa from 'papaparse'

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        resolve(results.data)
      },
      error: (error: any) => {
        reject(error)
      }
    })
  })
}
