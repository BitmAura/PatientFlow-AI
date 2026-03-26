'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TemplatePreview } from '@/components/reminders/template-preview' // Reuse existing preview
import { VariableButtons } from '@/components/reminders/variable-buttons' // Reuse existing

interface CampaignMessageEditorProps {
  name: string
  message: string
  onNameChange: (val: string) => void
  onMessageChange: (val: string) => void
}

export function CampaignMessageEditor({ name, message, onNameChange, onMessageChange }: CampaignMessageEditorProps) {
  const handleInsertVariable = (variable: string) => {
    // Simple append for MVP, ideally insert at cursor ref
    onMessageChange(message + variable)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Campaign Name (Internal)</Label>
          <Input 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)} 
            placeholder="e.g. October Checkup Drive"
          />
        </div>

        <div className="space-y-2">
          <Label>Message Content</Label>
          <Textarea 
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="h-[300px] resize-none font-mono text-sm"
            placeholder="Type your message..."
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={message.length > 4096 ? "text-red-500" : ""}>
              {message.length} / 4096 characters
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Insert Variable</Label>
          <VariableButtons onInsert={handleInsertVariable} />
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center border">
        <TemplatePreview template={message} />
      </div>
    </div>
  )
}
