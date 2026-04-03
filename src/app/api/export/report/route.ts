import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'
import { exportToExcel } from '@/lib/export/to-excel'
import { exportToCSV } from '@/lib/export/to-csv'
import { ColumnDefinition } from '@/lib/export/column-definitions'

type ReportRow = {
  date: string
  patient: string
  phone: string
  service: string
  doctor: string
  status: string
  source: string
  deposit_amount: number
  deposit_status: string
}

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

  const { report_type, date_from, date_to, format = 'pdf' } = await request.json()

  const { data: staffRow } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staffRow?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, name')
    .eq('id', staffRow.clinic_id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const fromIso = new Date(date_from).toISOString()
  const toDate = new Date(date_to)
  toDate.setHours(23, 59, 59, 999)

  const { data: appointments, error: appointmentsError } = await (supabase as any)
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      source,
      deposit_amount,
      deposit_status,
      patients(full_name, phone),
      services(name),
      doctors(name)
    `)
    .eq('clinic_id', (clinic as any).id)
    .gte('start_time', fromIso)
    .lte('start_time', toDate.toISOString())
    .order('start_time', { ascending: false })

  if (appointmentsError) {
    return new NextResponse('Failed to generate report data', { status: 500 })
  }

  const rows: ReportRow[] = (appointments || []).map((appointment: any) => ({
    date: new Date(appointment.start_time).toLocaleDateString(),
    patient: appointment.patients?.full_name || 'Unknown',
    phone: appointment.patients?.phone || '-',
    service: appointment.services?.name || '-',
    doctor: appointment.doctors?.name || '-',
    status: appointment.status || '-',
    source: appointment.source || '-',
    deposit_amount: Number(appointment.deposit_amount || 0),
    deposit_status: appointment.deposit_status || '-',
  }))

  const totalAppointments = rows.length
  const completed = rows.filter((row: ReportRow) => row.status === 'completed').length
  const noShows = rows.filter((row: ReportRow) => row.status === 'no_show').length
  const totalDeposits = rows
    .filter((row: ReportRow) => row.deposit_status === 'paid')
    .reduce((sum: number, row: ReportRow) => sum + row.deposit_amount, 0)

  let fileBuffer: Blob
  let filename: string
  let contentType: string

  if (format === 'excel') {
    fileBuffer = await exportToExcel(rows, `${report_type}-report`)
    filename = `${report_type}_report_${new Date().toISOString().split('T')[0]}.xlsx`
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  } else if (format === 'csv') {
    const columns: ColumnDefinition[] = [
      { key: 'date', label: 'Date' },
      { key: 'patient', label: 'Patient' },
      { key: 'phone', label: 'Phone' },
      { key: 'service', label: 'Service' },
      { key: 'doctor', label: 'Doctor' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
      { key: 'deposit_amount', label: 'Deposit Amount', format: 'currency' },
      { key: 'deposit_status', label: 'Deposit Status' },
    ]
    fileBuffer = exportToCSV(rows, columns, `${report_type}-report`)
    filename = `${report_type}_report_${new Date().toISOString().split('T')[0]}.csv`
    contentType = 'text/csv'
  } else {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text((clinic as any).name, 14, 20)
    doc.setFontSize(13)
    doc.text(`${String(report_type || 'summary').toUpperCase()} REPORT`, 14, 28)
    doc.setFontSize(10)
    doc.text(`Period: ${date_from} to ${date_to}`, 14, 34)

    doc.setFontSize(11)
    doc.text(`Total Appointments: ${totalAppointments}`, 14, 44)
    doc.text(`Completed: ${completed}`, 14, 50)
    doc.text(`No-Shows: ${noShows}`, 14, 56)
    doc.text(`Paid Deposits: INR ${totalDeposits.toFixed(2)}`, 14, 62)

    autoTable(doc, {
      startY: 70,
      head: [['Date', 'Patient', 'Service', 'Doctor', 'Status', 'Source']],
      body: rows.slice(0, 300).map((row) => [row.date, row.patient, row.service, row.doctor, row.status, row.source]),
      styles: { fontSize: 8 },
    })

    fileBuffer = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
    filename = `${report_type}_report_${new Date().toISOString().split('T')[0]}.pdf`
    contentType = 'application/pdf'
  }

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'export',
    entityType: 'report',
    newValues: {
      report_type,
      date_from,
      date_to,
      format,
      record_count: rows.length,
    },
    request,
  })

  const arrayBuffer = await fileBuffer.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}