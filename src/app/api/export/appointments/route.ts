import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportToExcel } from '@/lib/export/to-excel'
import { exportToCSV } from '@/lib/export/to-csv'
import { exportTableToPDF } from '@/lib/export/to-pdf'
import { APPOINTMENT_COLUMNS } from '@/lib/export/column-definitions'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { date_from, date_to, status, columns: selectedKeys, format } = await request.json()

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })
  const clinic = { id: staff.clinic_id as string }

  // Build query
  let query = supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      services (name, price, deposit_amount),
      patients (full_name, phone),
      doctors (name)
    `)
    .eq('clinic_id', (clinic as any).id)
    .gte('start_time', date_from)
    .lte('start_time', date_to)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: appointments, error } = await query.order('start_time', { ascending: false })

  if (error) {
    return new NextResponse('Failed to fetch appointments', { status: 500 })
  }

  // Transform data for export
  const exportData = (appointments as any[]).map(apt => ({
    id: apt.id,
    date: new Date(apt.start_time).toLocaleDateString(),
    time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    patient_name: apt.patients?.full_name || 'N/A',
    patient_phone: apt.patients?.phone || 'N/A',
    service: apt.services?.name || 'N/A',
    price: apt.services?.price || 0,
    deposit: apt.services?.deposit_amount || 0,
    status: apt.status,
    doctor: apt.doctors?.name || 'N/A'
  }))

  // Filter columns if specified
  const finalColumns = selectedKeys?.length > 0 
    ? APPOINTMENT_COLUMNS.filter(col => selectedKeys.includes(col.key))
    : APPOINTMENT_COLUMNS

  let fileBuffer: Blob
  let filename: string
  let contentType: string

  switch (format) {
    case 'excel':
      fileBuffer = await exportToExcel(exportData, `appointments-${new Date().toISOString().split('T')[0]}`)
      filename = `appointments-${new Date().toISOString().split('T')[0]}.xlsx`
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    case 'csv':
      fileBuffer = exportToCSV(exportData, finalColumns, `appointments-${new Date().toISOString().split('T')[0]}`)
      filename = `appointments-${new Date().toISOString().split('T')[0]}.csv`
      contentType = 'text/csv'
      break
    case 'pdf':
      fileBuffer = await exportTableToPDF(exportData, 'Appointments Report')
      filename = `appointments-${new Date().toISOString().split('T')[0]}.pdf`
      contentType = 'application/pdf'
      break
    default:
      return new NextResponse('Invalid format', { status: 400 })
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileBuffer.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'export',
    entityType: 'appointments',
    newValues: {
      format,
      date_from,
      date_to,
      status: status || 'all',
      selected_columns: finalColumns.length,
      record_count: exportData.length,
    },
    request,
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}