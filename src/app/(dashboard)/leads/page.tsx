import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Leads | PatientFlow AI',
  description: 'Internal CRM for tracking sales leads',
}

export default async function LeadsPage() {
  async function createLead(formData: FormData) {
    'use server'

    const supabase = createClient() as any
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const leadName = String(formData.get('leadName') || '').trim()
    const source = String(formData.get('source') || '').trim()
    const status = String(formData.get('status') || 'new').trim()
    const notes = String(formData.get('notes') || '').trim()
    const followupAt = String(formData.get('followupAt') || '').trim()

    if (!leadName || !source) {
      return
    }

    const { data: staffData } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (!staffData?.clinic_id) {
      return
    }

    await supabase.from('leads').insert({
      clinic_id: staffData.clinic_id,
      full_name: leadName,
      source,
      status,
      notes: notes || null,
      next_followup_at: followupAt ? new Date(followupAt).toISOString() : null,
      followup_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    revalidatePath('/leads')
  }

  async function updateLead(formData: FormData) {
    'use server'

    const supabase = createClient() as any
    const leadId = String(formData.get('leadId') || '').trim()
    const status = String(formData.get('status') || '').trim()
    const notes = String(formData.get('notes') || '').trim()
    const followupAt = String(formData.get('followupAt') || '').trim()

    if (!leadId) {
      return
    }

    await supabase
      .from('leads')
      .update({
        status: status || undefined,
        notes: notes || null,
        next_followup_at: followupAt ? new Date(followupAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    revalidatePath('/leads')
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (staffError || !staffData) {
    return <div>User not linked to a clinic.</div>
  }

  const clinicId = (staffData as any).clinic_id
  const { data: leads } = await supabase
    .from('leads')
    .select('id, full_name, source, status, notes, next_followup_at, created_at, updated_at')
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false })

  const pipelineCount = {
    new: leads?.filter((lead: any) => lead.status === 'new').length || 0,
    contacted: leads?.filter((lead: any) => lead.status === 'contacted').length || 0,
    demo: leads?.filter((lead: any) => lead.status === 'responsive').length || 0,
    closed: leads?.filter((lead: any) => lead.status === 'booked').length || 0,
  }

  const sourceOptions = ['website', 'meta_ads', 'google_ads', 'referral', 'walk_in', 'other']
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'responsive', label: 'Demo' },
    { value: 'booked', label: 'Closed' },
  ]

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales CRM</h2>
          <p className="text-sm text-muted-foreground">
            Track leads, capture notes, and schedule follow-ups to close deals faster.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">New</p>
          <p className="text-2xl font-semibold">{pipelineCount.new}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Contacted</p>
          <p className="text-2xl font-semibold">{pipelineCount.contacted}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Demo</p>
          <p className="text-2xl font-semibold">{pipelineCount.demo}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Closed</p>
          <p className="text-2xl font-semibold">{pipelineCount.closed}</p>
        </div>
      </div>

      <form action={createLead} className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Add Lead</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            required
            name="leadName"
            placeholder="Lead name"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select name="source" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select source</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <select name="status" defaultValue="new" className="rounded-md border px-3 py-2 text-sm">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            name="followupAt"
            type="datetime-local"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
          >
            Add lead
          </button>
        </div>
        <textarea
          name="notes"
          placeholder="Notes (context, objections, next step)"
          className="mt-3 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
        />
      </form>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h3 className="text-lg font-semibold">Leads Pipeline</h3>
        </div>
        <div className="divide-y">
          {(leads || []).length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No leads yet. Add your first lead above.</p>
          )}

          {(leads || []).map((lead: any) => (
            <form key={lead.id} action={updateLead} className="space-y-3 p-4">
              <input type="hidden" name="leadId" value={lead.id} />
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">{lead.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Source: {lead.source} | Created: {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    name="status"
                    defaultValue={lead.status}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="followupAt"
                    type="datetime-local"
                    defaultValue={
                      lead.next_followup_at
                        ? new Date(lead.next_followup_at).toISOString().slice(0, 16)
                        : ''
                    }
                    className="rounded-md border px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md border bg-gray-50 px-3 py-2 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
              <textarea
                name="notes"
                defaultValue={lead.notes || ''}
                placeholder="Add notes"
                className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              />
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
