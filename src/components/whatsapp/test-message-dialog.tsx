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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSendTestMessage } from '@/hooks/use-whatsapp'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface TestMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPhone?: string
}

export function TestMessageDialog({ open, onOpenChange, defaultPhone }: TestMessageDialogProps) {
  const [phone, setPhone] = React.useState(defaultPhone || '')
  const [message, setMessage] = React.useState('Hello! This is a test message from PatientFlow AI.')
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  
  const sendTest = useSendTestMessage()

  const handleSend = async () => {
    setStatus('idle')
    try {
      await sendTest.mutateAsync({ phone, message })
      setStatus('success')
      setTimeout(() => {
        onOpenChange(false)
        setStatus('idle')
      }, 2000)
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Message</DialogTitle>
          <DialogDescription>
            Verify your connection by sending a message to yourself or a team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Recipient Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="+1 234 567 8900" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              Message sent successfully!
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              Failed to send message. Please check connection.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendTest.isPending || !phone}>
            {sendTest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
