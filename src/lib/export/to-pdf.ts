export function exportTableToPDF(data: any[], title: string): Promise<Blob> {
  // Mock implementation - in real app would use jspdf
  const content = `${title}\n\n${JSON.stringify(data, null, 2)}`
  return Promise.resolve(new Blob([content], { type: 'text/plain' }))
}

export function generateReportPDF(reportType: string, data: any, dateRange: any): Promise<Blob> {
  // Mock implementation - in real app would use jspdf
  return Promise.resolve(new Blob(['Mock PDF content'], { type: 'application/pdf' }))
}