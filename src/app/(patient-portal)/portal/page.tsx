import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/portal/session'
import { PatientAppointments } from '@/components/portal/patient-appointments'

export default async function PortalPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)

  if (!session) {
    redirect('/portal/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Appointments</h1>
        <p className="text-muted-foreground">Manage your upcoming visits and view history.</p>
      </div>
      <PatientAppointments />
    </div>
  )
}
