import { read, utils } from 'xlsx'

export async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) // Get as array of arrays first
        
        // Extract headers
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        // Convert to array of objects with proper headers
        const result = rows.map(row => {
          const obj: Record<string, any> = {}
          headers.forEach((header, index) => {
            if (header) {
              obj[header.trim()] = row[index]
            }
          })
          return obj
        })
        
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}
