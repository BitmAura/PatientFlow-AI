import { NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function GET(
  request: Request,
  context: any
) {
  // Generate PDF on fly
  const doc = new jsPDF()
  doc.text(`Invoice #${context.params.id}`, 10, 10)
  doc.text('Thank you for your business.', 10, 20)
  
  const pdfBuffer = doc.output('arraybuffer')
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${context.params.id}.pdf"`
    }
  })
}

