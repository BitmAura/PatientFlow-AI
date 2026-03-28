export function generateExcelTemplate() {
  // Security hardening: return CSV template content.
  return generateCSVTemplate()
}

export function generateCSVTemplate() {
  const headers = 'Name,Phone,Email,Date of Birth,Gender,Address,City,Total Visits,No Shows,Tags,Notes\n'
  const row1 = 'John Doe,9876543210,john@example.com,1990-01-01,Male,123 Main St,New York,5,0,"VIP, Implant",Allergic to Penicillin\n'
  const row2 = 'Jane Smith,9123456789,jane@example.com,1985-05-15,Female,456 Oak Ave,Brooklyn,2,1,Ortho,\n'
  
  const blob = new Blob([headers + row1 + row2], { type: 'text/csv' })
  return blob
}
