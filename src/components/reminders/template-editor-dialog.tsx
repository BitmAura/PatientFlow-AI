'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { VariableButtons } from './variable-buttons'
import { TemplatePreview } from './template-preview'
import { validateTemplate } from '@/lib/whatsapp/templates'
import { RotateCcw } from 'lucide-react'

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  defaultTemplate: string
  value: string
  onSave: (newValue: string) => void
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  title,
  defaultTemplate,
  value,
  onSave
}: TemplateEditorDialogProps) {
  const [content, setContent] = React.useState(value)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Reset content when dialog opens with new value
  React.useEffect(() => {
    if (open) setContent(value)
  }, [open, value])

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + variable + content.substring(end)
    
    setContent(newContent)
    
    // Restore focus and move cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const handleReset = () => {
    if (confirm('Reset template to default?')) {
      setContent(defaultTemplate)
    }
  }

  const handleSave = () => {
    onSave(content)
    onOpenChange(false)
  }

  const validation = validateTemplate(content)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Template: {title}</DialogTitle>
          <DialogDescription>
            Customize the message sent to patients. Use variables to insert dynamic data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden py-4">
          {/* Editor Side */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            <div className="space-y-2 flex-1 flex flex-col">
              <Label>Message Content</Label>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 min-h-[300px] font-mono text-sm resize-none"
                placeholder="Type your message here..."
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={content.length > 4096 ? "text-red-500 font-medium" : ""}>
                  {content.length} / 4096 characters
                </span>
                {!validation.valid && (
                  <span className="text-red-500 font-medium">{validation.error}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Insert Variable</Label>
              <VariableButtons onInsert={handleInsertVariable} />
            </div>
          </div>

          {/* Preview Side */}
          <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center border">
            <TemplatePreview template={content} />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!validation.valid || content === value}>
              Save Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
