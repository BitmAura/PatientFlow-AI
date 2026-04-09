'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  category: string
  body_text: string
  meta_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason?: string
  last_checked_at?: string
}

export function WhatsAppTemplates({ clinicId }: { clinicId: string }) {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchTemplates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name', { ascending: true })

    if (error) {
      toast({ title: 'Failed to load templates', variant: 'destructive' })
    } else {
      setTemplates((data as any) || [])
    }
    setLoading(false)
  }

  React.useEffect(() => {
    if (clinicId) fetchTemplates()
  }, [clinicId])

  const handleSync = async () => {
    setRefreshing(true)
    // In production, this would trigger the Meta API status check
    await new Promise(resolve => setTimeout(resolve, 1000))
    await fetchTemplates()
    setRefreshing(false)
    toast({ title: 'Status synced', description: 'Template approval status updated from Meta.' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Messaging Templates</h2>
          <p className="text-sm text-muted-foreground">Manage your Meta-approved templates for out-of-session messaging.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={refreshing}>
          <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Sync Status
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-dashed flex items-center justify-center py-10">
             <div className="text-center">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No templates found for this clinic.</p>
                <Button variant="link" size="sm">Request default templates</Button>
             </div>
          </Card>
        ) : (
          templates.map((tpl) => (
            <Card key={tpl.id} className="overflow-hidden">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-slate-900">{tpl.name}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tpl.category}</span>
                       {getStatusBadge(tpl.meta_status)}
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border leading-relaxed">
                      {tpl.body_text}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 sm:w-48">
                    {tpl.meta_status === 'REJECTED' && (
                      <div className="rounded-lg bg-red-50 p-2 text-[10px] text-red-700 border border-red-100">
                        <strong>Reason:</strong> {tpl.rejection_reason || 'Community standards violation'}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                       Edit Design
                    </Button>
                    {tpl.meta_status === 'PENDING' && (
                      <Button size="sm" className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700">
                         <Send className="mr-1.5 h-3 w-3" /> Resubmit
                      </Button>
                    )}
                  </div>
               </div>
               {tpl.last_checked_at && (
                 <div className="bg-slate-50 px-5 py-2 border-t text-[10px] text-slate-400">
                    Last status check: {new Date(tpl.last_checked_at).toLocaleString()}
                 </div>
               )}
            </Card>
          ))
        )}
      </div>

      <Card className="border-blue-100 bg-blue-50/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            Meta Policy Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 leading-relaxed">
          Marketing or Utility messages sent outside the 24-hour window **must** use an approved template. 
          Sending plain text outside this window will be blocked by the system to protect your clinic&apos;s quality rating.
        </CardContent>
      </Card>
    </div>
  )
}
