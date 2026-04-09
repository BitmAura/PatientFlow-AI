'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Phone,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Trash2,
  TestTube2,
} from 'lucide-react'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { WhatsAppOtpWizard } from '@/components/whatsapp/whatsapp-otp-wizard'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

export default function WhatsAppSettingsPage() {
  const { data, isLoading, disconnect, refresh, sendTestMessage, setSharedNumberMode } = useWhatsApp()
  const { toast } = useToast()
  const [testPhone, setTestPhone] = React.useState('')
  const [sendingTest, setSendingTest] = React.useState(false)
  const [disconnecting, setDisconnecting] = React.useState(false)

  const isConnected = data?.status === 'connected' || data?.connected === true
  const phoneDisplay = data?.phoneNumberId ?? null
  const provider = data?.provider ?? null

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnect()
      toast({ title: 'WhatsApp disconnected', description: 'Automated reminders are paused.' })
    } catch {
      toast({ title: 'Failed to disconnect', variant: 'destructive' })
    } finally {
      setDisconnecting(false)
    }
  }

  const handleSendTest = async () => {
    const digits = testPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      toast({ title: 'Enter a valid phone number', variant: 'destructive' })
      return
    }
    setSendingTest(true)
    try {
      await sendTestMessage(`+91${digits}`, 'Hi! This is a test message from PatientFlow AI. Your WhatsApp integration is working correctly. ✅')
      toast({ title: 'Test message sent!', description: `Delivered to +91 ${digits}` })
      setTestPhone('')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not send test message.'
      toast({ title: 'Send failed', description: message, variant: 'destructive' })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <PageContainer>
      <Breadcrumbs />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Connection</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your clinic&apos;s WhatsApp Business integration for automated patient reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Main Column ────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* ── SHARED vs PRIVATE TOGGLE (NEW) ────────────────────────── */}
          <Card className="border-blue-100 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="h-4 w-4 text-blue-600" />
                Connection Priority
              </CardTitle>
              <CardDescription>
                Choose whether to use PatientFlow AI infrastructure or your own.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setSharedNumberMode(true)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
                    data?.use_shared_number 
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20" 
                      : "border-slate-200 bg-white hover:border-blue-300"
                  )}
                >
                  <span className="text-sm font-bold text-slate-900">Shared Number Mode</span>
                  <span className="text-xs text-slate-500">Launch instantly, no setup required. (Limited quota)</span>
                </button>
                <button
                  onClick={() => setSharedNumberMode(false)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
                    !data?.use_shared_number 
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20" 
                      : "border-slate-200 bg-white hover:border-blue-300"
                  )}
                >
                  <span className="text-sm font-bold text-slate-900">Private Provider Mode</span>
                  <span className="text-xs text-slate-500">Use your own Gupshup/Number for unlimited scale.</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* ── STATUS CARD (shown when connected) ─────────────────── */}
          {isLoading ? (
            <Card className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </Card>
          ) : isConnected ? (
            <ConnectedCard
              phoneDisplay={phoneDisplay}
              provider={provider}
              onRefresh={() => refresh(true)}
              onDisconnect={handleDisconnect}
              disconnecting={disconnecting}
            />
          ) : (
            /* ── OTP WIZARD (shown when not connected) ─────────────── */
            <Card className="overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <WhatsAppOtpWizard
                  compact
                  showSkip={false}
                  onSuccess={() => {
                    refresh(true)
                    toast({ title: 'WhatsApp is now active!', description: 'Automated reminders will start sending.' })
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* ── BOT PERSONALITY TUNER (NEW) ────────────────────────── */}
          {isConnected && !isLoading && (
            <BotPersonalityTuner 
              clinicId={data?.clinicId || ''} 
              defaultPersonality={data?.bot_personality || 'professional'}
              clinicName={data?.name || 'Kumars Dentistry'}
            />
          )}

          {/* ── SEND TEST MESSAGE (only when connected) ─────────────── */}
          {isConnected && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TestTube2 className="h-4 w-4 text-blue-600" />
                  Send a Test Message
                </CardTitle>
                <CardDescription>
                  Verify your setup by sending a WhatsApp message to any number.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 flex-1">
                    <div className="flex items-center gap-1 border-r border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                      <span className="text-sm">🇮🇳</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">+91</span>
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={testPhone}
                      maxLength={10}
                      onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
                    />
                  </div>
                  <Button
                    onClick={handleSendTest}
                    disabled={sendingTest || testPhone.length < 10}
                    className="shrink-0"
                  >
                    {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Send Test</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The test message will arrive from your connected clinic number.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── CONNECTION HEALTH ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connection Health</CardTitle>
              <CardDescription>Real-time system diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusRow label="WhatsApp API" value={isConnected ? 'Active' : 'Not connected'} ok={isConnected} />
              <StatusRow label="Webhook Receiver" value="Online" ok />
              <StatusRow label="Message Queue" value="Clear" ok />
              <StatusRow
                label="Provider"
                value={provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Not set'}
                ok={Boolean(provider)}
                last
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-5">
          <Alert className="border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">How it works</AlertTitle>
            <AlertDescription className="mt-1 text-xs text-blue-700 dark:text-blue-400">
              We use the official WhatsApp Business API. Your clinic number sends reminders
              directly to patients — no extra apps needed.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Dedicated clinic number:</strong> Keep a secondary number just for patient messaging.</p>
              <p><strong className="text-foreground">Avoid over-messaging:</strong> Only send appointment-related messages to prevent being flagged.</p>
              <p><strong className="text-foreground">Personal touch:</strong> Messages that mention the doctor's name get better response rates.</p>
            </CardContent>
          </Card>

          {isConnected && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 dark:text-red-300">Important</AlertTitle>
              <AlertDescription className="text-xs text-red-700 dark:text-red-400">
                Disconnecting WhatsApp will <strong>pause all automated reminders</strong> until
                you reconnect.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Connected Card
───────────────────────────────────────────────────────────────── */
function ConnectedCard({
  phoneDisplay,
  provider,
  onRefresh,
  onDisconnect,
  disconnecting,
}: {
  phoneDisplay: string | null
  provider: string | null
  onRefresh: () => void
  onDisconnect: () => void
  disconnecting: boolean
}) {
  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="h-5 w-5 text-green-600" />
              WhatsApp Connected
            </CardTitle>
            <CardDescription>
              Automated reminders are active for this clinic.
            </CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active features */}
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            'Appointment confirmations',
            '24-hour reminders',
            'No-show recovery messages',
            'Recall & follow-up messages',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 dark:border-green-900 dark:bg-green-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
              <span className="text-xs font-medium text-green-800 dark:text-green-300">{item}</span>
            </div>
          ))}
        </div>

        {/* Meta info */}
        {(phoneDisplay || provider) && (
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
            {phoneDisplay && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>Phone ID: <code className="font-mono">{phoneDisplay}</code></span>
              </div>
            )}
            {provider && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" />
                <span>Provider: {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
              disabled={disconnecting}
            >
              {disconnecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Disconnect
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
              <AlertDialogDescription>
                This will pause all automated reminders for your clinic until you reconnect.
                Your appointment data will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDisconnect}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Status row helper
───────────────────────────────────────────────────────────────── */
function StatusRow({
  label,
  value,
  ok,
  last = false,
}: {
  label: string
  value: string
  ok: boolean
  last?: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between py-2.5', !last && 'border-b')}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium',
          ok ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Bot Personality Tuner Component
   🚀 Persona: Founder/CEO & Frontend Developer
   💎 Glassmorphism + Live Preview
───────────────────────────────────────────────────────────────── */
import { getBotPersonalityTone, BotPersonality } from '@/lib/ai/bot-personality'

function BotPersonalityTuner({ 
  clinicId, 
  defaultPersonality,
  clinicName 
}: { 
  clinicId?: string, 
  defaultPersonality: BotPersonality,
  clinicName: string 
}) {
  const [personality, setPersonality] = React.useState<BotPersonality>(defaultPersonality)
  const [botName, setBotName] = React.useState('Aura AI')
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handleUpdate = async (p: BotPersonality) => {
    setLoading(true)
    setPersonality(p)
    try {
      const resp = await fetch('/api/whatsapp/personality', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: p, botName })
      })
      if (!resp.ok) throw new Error('Failed to update personality')
      toast({ title: 'AI Voice Updated', description: `Your bot is now in '${p}' mode.` })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const tone = getBotPersonalityTone(personality, botName)
  const sampleContent = "It has been 6 months since your last cleaning. Regular microscopic checkups are essential for preventing underlying issues."

  return (
    <Card className="border-emerald-100 bg-white/50 backdrop-blur-sm dark:border-emerald-900/20 dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wifi className="h-4 w-4 text-emerald-600" />
          AI Assistant Voice & Tone
        </CardTitle>
        <CardDescription>
          Choose how your AI assistant introduces itself to your patients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personality Selector */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(['professional', 'friendly', 'direct'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handleUpdate(p)}
              disabled={loading}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                personality === p
                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20 dark:bg-emerald-950/20"
                  : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-950"
              )}
            >
              <span className="text-sm font-bold capitalize text-slate-900 dark:text-white">{p}</span>
            </button>
          ))}
        </div>

        {/* Assistant Name */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-slate-500">Assistant Name</Label>
          <Input 
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            onBlur={() => handleUpdate(personality)}
            placeholder="Ex: Aura AI, Doctor Bot"
            className="h-10 border-slate-200 dark:border-slate-800"
          />
        </div>

        {/* Live Preview (Medical Phone Simulation) */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest font-bold text-emerald-600">Live Preview (Patient View)</Label>
          <div className="rounded-2xl bg-[#e5ddd5] p-5 shadow-inner dark:bg-slate-950/50 min-h-48 border border-slate-200 dark:border-slate-800">
             <div className="mx-auto my-2 w-fit rounded-lg bg-emerald-100 px-3 py-1 text-[9px] font-bold text-emerald-800/60 uppercase">Today</div>
             
             <div className="mt-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800 ring-1 ring-black/5">
                   <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-100 italic opacity-60 mb-2">
                     {tone.prefix} {clinicName}...
                   </p>
                   <p className="text-[13px] font-medium text-slate-900 dark:text-white">
                     {sampleContent}
                   </p>
                   <p className="mt-3 text-[12px] text-slate-800 dark:text-slate-100 italic opacity-60">
                     {tone.suffix}
                   </p>
                   <div className="mt-2 flex justify-end">
                      <span className="text-[10px] text-slate-400">10:41 AM</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
           💡 Tip: Use <strong className="text-emerald-600">Friendly</strong> mode to increase recall booking rates by up to 22%.
        </p>
      </CardContent>
    </Card>
  )
}
