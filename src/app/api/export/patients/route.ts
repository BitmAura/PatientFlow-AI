import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportToExcel } from '@/lib/export/to-excel'
import { exportToCSV } from '@/lib/export/to-csv'
import { PATIENT_COLUMNS } from '@/lib/export/column-definitions'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { columns: selectedKeys, format } = await request.json()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', (clinic as any).id)

  const selected = Array.isArray(selectedKeys) && selectedKeys.length > 0
    ? selectedKeys
    : PATIENT_COLUMNS.map((column) => column.key)
  const columns = PATIENT_COLUMNS.filter(c => selected.includes(c.key))
  const targetFormat = format === 'excel' ? 'excel' : 'csv'
  const filename = `patients_list.${targetFormat === 'excel' ? 'xlsx' : 'csv'}`

  let fileBlob: Blob

  switch (targetFormat) {
    case 'excel':
      fileBlob = await exportToExcel(patients || [], filename)
      break
    case 'csv':
      fileBlob = exportToCSV(patients || [], columns, filename)
      break
    default:
      return new NextResponse('Invalid format', { status: 400 })
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileBlob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'export',
    entityType: 'patients',
    newValues: {
      format: targetFormat,
      selected_columns: selected.length,
      record_count: patients?.length || 0,
    },
    request,
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': targetFormat === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}