'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function WhatsAppTestSender() {
  const { data, sendTestMessage } = useWhatsApp()
  const [phone, setPhone] = React.useState('')
  const [message, setMessage] = React.useState('Hello from PatientFlow AI! This is a test message.')
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const isConnected = data?.status === 'connected' || data?.status === 'active'

  const handleSend = async () => {
    if (!phone || !message) return
    setStatus('sending')
    try {
      await sendTestMessage(phone, message)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      setStatus('error')
    }
  }

  if (!isConnected) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Connection</CardTitle>
        <CardDescription>Send a test message to verify the integration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Recipient Number</Label>
          <Input 
            placeholder="+1 234 567 890" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Message</Label>
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
        
        {status === 'success' && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Message sent successfully!</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to send message. Check console.</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSend} 
          disabled={status === 'sending' || !phone}
          className="w-full"
        >
          {status === 'sending' ? 'Sending...' : 'Send Test Message'}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
