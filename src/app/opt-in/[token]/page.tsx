import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyConsentToken } from '@/lib/whatsapp/consent-token'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface OptInPageProps {
  params: Promise<{ token: string }>
}

export default async function OptInPage({ params }: OptInPageProps) {
  const { token } = await params
  const verified = verifyConsentToken(token)
  
  if (!verified) {
    return notFound()
  }

  const supabase = createAdminClient() as any
  
  // Fetch patient and clinic details
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*, clinic:clinics(name)')
    .eq('id', verified.patientId)
    .single()

  if (error || !patient) {
    return notFound()
  }

  // Auto-opt-in if they land here (since the link is explicitly for opt-in)
  // or show a button. We'll show a button for "confirm" to be safe.
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">WhatsApp Opt-in</CardTitle>
          <CardDescription className="text-base font-medium text-slate-900 dark:text-slate-100">
            {patient.clinic?.name || 'Aura Digital Services'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center">
             Hi <span className="font-bold text-slate-900 dark:text-white">{patient.full_name}</span>,<br/> 
             Authorize us to send your appointment reminders and updates directly to your WhatsApp.
          </p>

          <div className="space-y-3">
             <div className="flex items-start gap-3 rounded-lg border bg-white p-3 dark:bg-slate-900">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Fast appointment confirmations.</span>
             </div>
             <div className="flex items-start gap-3 rounded-lg border bg-white p-3 dark:bg-slate-900">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Reschedule easily via chat.</span>
             </div>
             <div className="flex items-start gap-3 rounded-lg border bg-white p-3 dark:bg-slate-900">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Secure & Spam-free. Official Business API.</span>
             </div>
          </div>

          <form action={async () => {
             'use server'
             const adminSupabase = createAdminClient() as any
             await adminSupabase
                .from('patients')
                .update({ 
                    whatsapp_consent: true, 
                    consent_given_at: new Date().toISOString(),
                    consent_method: 'link'
                })
                .eq('id', patient.id)
                // Redirect logic would go here, or we'll just show success on the page
          }}>
             <Button type="submit" className="w-full text-lg h-12 shadow-lg hover:shadow-primary/20">
                Confirm Opt-in
             </Button>
          </form>

          <p className="text-[10px] text-center text-slate-400">
            By clicking confirm, you agree to receive automated notifications. 
            You can reply STOP at any time to opt-out.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
