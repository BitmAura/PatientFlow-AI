'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { CampaignTypeSelector } from '@/components/campaigns/campaign-type-selector'
import { AudienceBuilder } from '@/components/campaigns/audience-builder'
import { CampaignMessageEditor } from '@/components/campaigns/campaign-message-editor'
import { CampaignSchedule } from '@/components/campaigns/campaign-schedule'
import { CampaignReview } from '@/components/campaigns/campaign-review'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { CAMPAIGN_TYPES } from '@/constants/campaign-types'
import { useCreateCampaign } from '@/hooks/use-campaigns'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const STEPS = ['Type', 'Audience', 'Message', 'Schedule', 'Review']

export default function NewCampaignPage() {
  const [step, setStep] = React.useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const createCampaign = useCreateCampaign()

  const [formData, setFormData] = React.useState({
    type: '',
    name: '',
    audience_filter: { exclude_opted_out: true },
    message: '',
    scheduled_at: undefined as string | undefined,
    send_immediately: false
  })

  // Pre-fill message template when type changes
  const handleTypeSelect = (type: string) => {
    const template = CAMPAIGN_TYPES.find(t => t.id === type)?.defaultTemplate || ''
    setFormData(prev => ({ 
      ...prev, 
      type, 
      message: template 
    }))
    setStep(1)
  }

  const handleCreate = async () => {
    try {
      await createCampaign.mutateAsync(formData as any)
      toast({ title: 'Campaign Created', description: 'Your campaign has been successfully created.' })
      router.push('/campaigns')
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create campaign.' })
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <CampaignTypeSelector selectedType={formData.type} onSelect={handleTypeSelect} />
      case 1:
        return (
          <AudienceBuilder 
            type={formData.type} 
            filters={formData.audience_filter}
            onFilterChange={(f) => setFormData({ ...formData, audience_filter: f })}
          />
        )
      case 2:
        return (
          <CampaignMessageEditor 
            name={formData.name}
            message={formData.message}
            onNameChange={(n) => setFormData({ ...formData, name: n })}
            onMessageChange={(m) => setFormData({ ...formData, message: m })}
          />
        )
      case 3:
        return (
          <CampaignSchedule 
            scheduledAt={formData.scheduled_at}
            sendImmediately={formData.send_immediately}
            onScheduleChange={(d) => setFormData({ ...formData, scheduled_at: d })}
            onImmediateChange={(i) => setFormData({ ...formData, send_immediately: i })}
          />
        )
      case 4:
        return (
          <CampaignReview 
            data={formData} 
            isSubmitting={createCampaign.isPending}
            onSubmit={handleCreate}
          />
        )
      default:
        return null
    }
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="max-w-5xl mx-auto mt-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div 
                key={s} 
                className={`text-sm font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {i + 1}. {s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} 
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        {step > 0 && step < 4 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(step + 1)} disabled={step === 2 && !formData.name}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
