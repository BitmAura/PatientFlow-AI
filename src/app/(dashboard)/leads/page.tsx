import { Suspense } from 'react'
import { KanbanBoard } from '@/components/leads/kanban-board'
import { AddLeadDialog } from '@/components/leads/add-lead-dialog'
import { getLeads } from '@/lib/actions/leads'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Leads | No Show Killer',
  description: 'Manage your patient pipeline',
}

export default async function LeadsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get clinic ID for the user
  // This assumes a user is linked to a staff record which is linked to a clinic
  // or checks public.users metadata.
  // For now, let's fetch the clinic ID from the staff table for this user
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (staffError || !staffData) {
    // Handle case where user is not staff (maybe admin? or onboarding?)
    // For safety, redirect or show error.
    // Assuming for now they have one.
    return <div>User not linked to a clinic.</div>
  }

  const clinicId = (staffData as any).clinic_id
  const leads = await getLeads(clinicId)

  return (
    <div className="flex h-full flex-col space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Lead Management</h2>
        <div className="flex items-center space-x-2">
          <AddLeadDialog clinicId={clinicId} />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <KanbanBoard initialLeads={leads || []} clinicId={clinicId} />
        </Suspense>
      </div>
    </div>
  )
}
