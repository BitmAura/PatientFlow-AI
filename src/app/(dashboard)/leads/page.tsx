import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'
import { ExportROIButton } from '@/components/dashboard/ExportROIButton'

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
    .select('*')
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false })

  const pipelineStats = {
    new: leads?.filter((l: any) => l.status === 'new').length || 0,
    contacted: leads?.filter((l: any) => l.status === 'contacted').length || 0,
    demo: leads?.filter((l: any) => l.status === 'responsive').length || 0,
    closed: leads?.filter((l: any) => l.status === 'booked').length || 0,
    pipelineValue: leads?.reduce((acc: number, l: any) => acc + (Number(l.estimated_value) || 0), 0) || 0,
    recoveredRevenue: leads?.filter((l: any) => l.status === 'booked')
      .reduce((acc: number, l: any) => acc + (Number(l.actual_revenue) || Number(l.estimated_value) || 0), 0) || 0,
  }

  const sourceOptions = ['website', 'meta_ads', 'google_ads', 'referral', 'walk_in', 'other']
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'responsive', label: 'Demo' },
    { value: 'booked', label: 'Closed' },
  ]

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Founder Dashboard"
        description="Monitor your clinic's revenue pipeline and lead conversion efficiency."
        actions={
          <div className="flex gap-2">
            <ExportROIButton 
              clinicName="Aura Partner" 
              leads={leads || []}
              stats={{
                recoveredRevenue: pipelineStats.recoveredRevenue,
                pipelineValue: pipelineStats.pipelineValue,
                conversionRate: leads?.length ? ((pipelineStats.closed / leads.length) * 100).toFixed(1) : '0',
                totalLeads: leads?.length || 0
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PageCard variant="default" padding className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/20 dark:bg-emerald-950/10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Recovered Revenue</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
            ₹{pipelineStats.recoveredRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-emerald-600/60 transition-opacity hover:opacity-100">Confirmed ROI from closed leads</p>
        </PageCard>
        
        <PageCard variant="default" padding className="border-slate-100 bg-slate-50/50 dark:border-slate-800/20 dark:bg-slate-900/10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Pipeline Value</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{pipelineStats.pipelineValue.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-slate-500/60">Total potential revenue in CRM</p>
        </PageCard>

        <PageCard variant="default" padding>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Leads</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {pipelineStats.new + pipelineStats.contacted + pipelineStats.demo}
          </p>
          <p className="mt-1 text-[10px] text-slate-500/60">Across all pipeline stages</p>
        </PageCard>

        <PageCard variant="default" padding>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Conversion Rate</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {leads?.length ? ((pipelineStats.closed / leads.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="mt-1 text-[10px] text-slate-500/60">ROI Efficiency (Closed/Total)</p>
        </PageCard>
      </div>

      <PageCard variant="default" padding className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <form action={createLead}>
          <h3 className="mb-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">Add New Lead</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lead Name</label>
              <input
                required
                name="leadName"
                placeholder="Ex: John Doe"
                aria-label="Lead name"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Source</label>
              <select 
                name="source" 
                required 
                aria-label="Source"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Select source</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
              <select 
                name="status" 
                defaultValue="new" 
                aria-label="Status"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Follow-up</label>
              <input
                name="followupAt"
                type="datetime-local"
                aria-label="Follow-up date"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-700/40 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Create Lead
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lead Context & Notes</label>
            <textarea
              name="notes"
              placeholder="Provide context like dental pain history, specific orthodontic interests, or objections mentioned..."
              aria-label="Notes"
              className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </form>
      </PageCard>

      <PageCard variant="default" padding={false} className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="text-lg font-semibold">Leads Pipeline</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
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
                    aria-label="Update Status"
                    title="Update Status"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
                    aria-label="Update Follow-up date and time"
                    title="Update Follow-up date and time"
                    defaultValue={
                      lead.next_followup_at
                        ? new Date(lead.next_followup_at).toISOString().slice(0, 16)
                        : ''
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
                  >
                    Save
                  </button>
                </div>
              </div>
              <textarea
                name="notes"
                defaultValue={lead.notes || ''}
                placeholder="Add notes"
                aria-label="Update Notes"
                title="Update Notes"
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </form>
          ))}
        </div>
      </PageCard>
    </PageContainer>
  )
}
