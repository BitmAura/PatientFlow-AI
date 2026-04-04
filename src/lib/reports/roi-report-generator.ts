import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Executive ROI Report Generator
 * 🚀 Activated by: CEO/Founder Persona
 * 📄 Built by: Document Generator
 */
export async function generateExecutiveROIReport(
  clinicName: string,
  stats: {
    recoveredRevenue: number
    pipelineValue: number
    conversionRate: string
    totalLeads: number
  },
  leads: any[]
): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const emeraldColor: [number, number, number] = [5, 150, 105] // Emerald 600

  // 1. Header Section (Premium Brand feel)
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2])
  doc.rect(0, 0, 595, 100, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PatientFlow AI: Revenue Impact Report', 40, 50)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Clinic: ${clinicName}`, 40, 75)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 450, 75)

  // 2. Executive Summary Cards (Simulated)
  doc.setTextColor(30, 41, 59) // Slate 800
  doc.setFontSize(14)
  doc.text('EXECUTIVE REVENUE SUMMARY', 40, 140)

  // Recovered Revenue Card
  doc.setDrawColor(209, 213, 219) // Gray 300
  doc.roundedRect(40, 160, 160, 80, 10, 10, 'D')
  doc.setFontSize(10)
  doc.text('TOTAL RECOVERED', 55, 185)
  doc.setFontSize(18)
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2])
  doc.text(`₹${stats.recoveredRevenue.toLocaleString()}`, 55, 215)

  // Pipeline Value Card
  doc.setTextColor(30, 41, 59)
  doc.roundedRect(215, 160, 160, 80, 10, 10, 'D')
  doc.setFontSize(10)
  doc.text('PIPELINE VALUE', 230, 185)
  doc.setFontSize(18)
  doc.text(`₹${stats.pipelineValue.toLocaleString()}`, 230, 215)

  // Conversion Card
  doc.roundedRect(390, 160, 160, 80, 10, 10, 'D')
  doc.setFontSize(10)
  doc.text('CONVERSION RATE', 405, 185)
  doc.setFontSize(18)
  doc.text(`${stats.conversionRate}%`, 405, 215)

  // 3. Detailed Lead Performance Table
  doc.setFontSize(14)
  doc.text('CONVERSION LOG', 40, 280)

  const tableData = leads.map(l => [
    l.full_name,
    l.status.toUpperCase(),
    l.source.replace('_', ' '),
    `₹${(l.estimated_value || 0).toLocaleString()}`,
    l.treatment_type || 'N/A'
  ])

  autoTable(doc, {
    startY: 300,
    head: [['Patient Name', 'Status', 'Source', 'Value', 'Treatment']],
    body: tableData,
    headStyles: { fillColor: emeraldColor },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 9 }
  })

  // 4. Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Confidential Revenue Asset - Powered by Aura Digital Services', 40, 820)
    doc.text(`Page ${i} of ${pageCount}`, 500, 820)
  }

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
}
