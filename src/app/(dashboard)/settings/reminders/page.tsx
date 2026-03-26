'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ReminderToggleCard } from '@/components/reminders/reminder-toggle-card'
import { TemplateEditorDialog } from '@/components/reminders/template-editor-dialog'
import { useReminderSettings } from '@/hooks/use-reminder-settings'
import { ReminderSettings } from '@/lib/validations/reminder'
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp/templates'
import { Button } from '@/components/ui/button'
import { Loader2, Save, CheckCircle, CalendarCheck, Clock, Bell, UserX, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const REMINDER_TYPES = [
  {
    key: 'booking_confirmation' as keyof ReminderSettings,
    title: 'Booking Confirmation',
    description: 'Sent immediately after an appointment is created.',
    icon: CalendarCheck
  },
  {
    key: 'reminder_24h' as keyof ReminderSettings,
    title: '24-Hour Reminder',
    description: 'Sent one day before the appointment.',
    icon: Clock
  },
  {
    key: 'reminder_2h' as keyof ReminderSettings,
    title: '2-Hour Reminder',
    description: 'Sent shortly before the appointment time.',
    icon: Bell
  },
  {
    key: 'no_show_followup' as keyof ReminderSettings,
    title: 'No-Show Follow-up',
    description: 'Sent when an appointment is marked as "No Show".',
    icon: UserX
  },
  {
    key: 'post_visit_message' as keyof ReminderSettings,
    title: 'Post-Visit Message',
    description: 'Sent after the appointment is completed (e.g. for feedback).',
    icon: MessageSquare
  }
]

export default function ReminderSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useReminderSettings()
  const { toast } = useToast()
  
  // Local state for unsaved changes
  const [localSettings, setLocalSettings] = React.useState<ReminderSettings | null>(null)
  const [editingKey, setEditingKey] = React.useState<keyof ReminderSettings | null>(null)

  // Sync with fetched settings
  React.useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings)
    }
  }, [settings, localSettings])

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings)

  const handleToggle = (key: keyof ReminderSettings, enabled: boolean) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      [key]: { ...localSettings[key] as any, enabled }
    })
  }

  const handleTemplateSave = (key: keyof ReminderSettings, template: string) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      [key]: { ...localSettings[key] as any, template }
    })
  }

  const handleSaveAll = () => {
    if (!localSettings) return
    updateSettings(localSettings, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "Your reminder configuration has been updated.",
        })
      }
    })
  }

  if (isLoading || !localSettings) {
    return (
      <PageContainer>
        <Breadcrumbs />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminder Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure automated messages and customize templates.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={!hasChanges || isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {hasChanges && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Don&apos;t forget to click Save when you&apos;re done.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {REMINDER_TYPES.map((type) => {
          const config = localSettings[type.key] as { enabled: boolean, template: string }
          
          // Fallback to default if template is somehow missing
          // Use type assertion because we know the key is one of the specific template keys
          const defaultTemplate = (DEFAULT_TEMPLATES as any)[type.key] || ''
          
          return (
            <React.Fragment key={type.key}>
              <ReminderToggleCard
                title={type.title}
                description={type.description}
                icon={type.icon}
                enabled={config.enabled}
                onToggle={(val) => handleToggle(type.key, val)}
                onEdit={() => setEditingKey(type.key)}
              />
            </React.Fragment>
          )
        })}
      </div>

      {/* Template Editor Dialog */}
      {editingKey && (
        <TemplateEditorDialog
          open={!!editingKey}
          onOpenChange={(open) => !open && setEditingKey(null)}
          title={REMINDER_TYPES.find(t => t.key === editingKey)?.title || ''}
          defaultTemplate={(DEFAULT_TEMPLATES as any)[editingKey] || ''}
          value={(localSettings[editingKey] as any).template}
          onSave={(val) => handleTemplateSave(editingKey, val)}
        />
      )}

    </PageContainer>
  )
}
