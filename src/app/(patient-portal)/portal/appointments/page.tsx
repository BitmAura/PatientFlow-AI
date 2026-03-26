import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/portal/session'
import { PatientAppointments } from '@/components/portal/patient-appointments'

export default async function AppointmentsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)

  if (!session) {
    redirect('/portal/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
      </div>
      <PatientAppointments />
    </div>
  )
}
