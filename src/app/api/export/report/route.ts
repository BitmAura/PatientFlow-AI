import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const ipLimiter = checkRateLimit(`export-report:ip:${ip}`, 30, 60_000)
  if (!ipLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many export attempts. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(ipLimiter.remaining),
        },
      }
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const userLimiter = checkRateLimit(`export-report:user:${user.id}`, 20, 60_000)
  if (!userLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many exports for this account. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(userLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(userLimiter.remaining),
        },
      }
    )
  }

  const { report_type, date_from, date_to } = await request.json()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  // Fetch report data based on type
  // For MVP, we'll generate a dummy PDF
  
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text((clinic as any).name, 14, 22)
  doc.setFontSize(14)
  doc.text(`${report_type.toUpperCase()} REPORT`, 14, 32)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Period: ${date_from} to ${date_to}`, 14, 38)

  // Content Placeholder
  doc.setTextColor(0)
  doc.text('Report generation logic to be implemented.', 14, 50)
  
  const pdfBuffer = doc.output('arraybuffer')

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'export',
    entityType: 'report',
    newValues: {
      report_type,
      date_from,
      date_to,
      format: 'pdf',
    },
    request,
  })

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${report_type}_report_${new Date().toISOString().split('T')[0]}.pdf"`,
    },
  })
}