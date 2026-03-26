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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useDisconnectWhatsApp } from '@/hooks/use-whatsapp'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DisconnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DisconnectDialog({ open, onOpenChange }: DisconnectDialogProps) {
  const [confirmed, setConfirmed] = React.useState(false)
  const disconnect = useDisconnectWhatsApp()

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync()
      onOpenChange(false)
      setConfirmed(false)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900">
            Disconnect WhatsApp
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-zinc-600">You are about to disconnect your number from PatientFlow AI. Here is what happens:</p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                <li>All automated messages will stop immediately.</li>
                <li>Your patient data remains safe and accessible.</li>
                <li>You can reconnect this number (or a new one) anytime.</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
              <h4 className="font-medium text-blue-900 text-sm">Moving back to the WhatsApp App?</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                To use this number on the standard WhatsApp mobile app again, you must first delete it from your Meta Business Manager to release it from the API. This usually takes about 15 minutes.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-2 space-y-1">
            <Checkbox 
              id="confirm" 
              checked={confirmed} 
              onCheckedChange={(c) => setConfirmed(c as boolean)} 
              className="mt-1"
            />
            <Label htmlFor="confirm" className="text-sm font-normal text-zinc-600 leading-snug cursor-pointer">
              I understand that automated reminders will stop.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Connected
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDisconnect} 
            disabled={!confirmed || disconnect.isPending}
          >
            {disconnect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disconnect Number
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
