import { utils, write } from 'xlsx'

export function generateExcelTemplate() {
  const headers = ['Name', 'Phone', 'Email', 'Date of Birth', 'Gender', 'Address', 'City', 'Total Visits', 'No Shows', 'Tags', 'Notes']
  const sampleData = [
    ['John Doe', '9876543210', 'john@example.com', '1990-01-01', 'Male', '123 Main St', 'New York', 5, 0, 'VIP, Implant', 'Allergic to Penicillin'],
    ['Jane Smith', '9123456789', 'jane@example.com', '1985-05-15', 'Female', '456 Oak Ave', 'Brooklyn', 2, 1, 'Ortho', '']
  ]
  
  const ws = utils.aoa_to_sheet([headers, ...sampleData])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Template')
  
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  
  return blob
}

export function generateCSVTemplate() {
  const headers = 'Name,Phone,Email,Date of Birth,Gender,Address,City,Total Visits,No Shows,Tags,Notes\n'
  const row1 = 'John Doe,9876543210,john@example.com,1990-01-01,Male,123 Main St,New York,5,0,"VIP, Implant",Allergic to Penicillin\n'
  const row2 = 'Jane Smith,9123456789,jane@example.com,1985-05-15,Female,456 Oak Ave,Brooklyn,2,1,Ortho,\n'
  
  const blob = new Blob([headers + row1 + row2], { type: 'text/csv' })
  return blob
}
