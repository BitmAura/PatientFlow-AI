export function downloadPatientImportTemplate() {
  const headers = ['full_name', 'phone', 'email', 'notes', 'tags']
  const sampleRow = ['John Doe', '919876543210', 'john@example.com', 'Requires cleaning', 'VIP']
  
  const csvContent = [
    headers.join(','),
    sampleRow.join(',')
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', 'patientflow_import_template.csv')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
