'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReminderLog, useResendMessage } from '@/hooks/use-reminder-logs'
import { MessageStatusIcon } from './message-status-icon'
import { format } from 'date-fns'
import { RefreshCw, ExternalLink, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface MessageDetailSheetProps {
  log: ReminderLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDetailSheet({ log, open, onOpenChange }: MessageDetailSheetProps) {
  const resend = useResendMessage()

  if (!log) return null

  const handleResend = async () => {
    await resend.mutateAsync(log.id)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{log.type.replace('_', ' ')}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <MessageStatusIcon status={log.status} />
              <span className="capitalize">{log.status}</span>
            </div>
          </div>
          <SheetTitle>Message Details</SheetTitle>
          <SheetDescription>
            Sent on {format(new Date(log.created_at), 'PPP at p')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          {/* Patient Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{log.patients?.full_name || 'Unknown patient'}</h4>
              <p className="text-sm text-muted-foreground">{log.patients?.phone || '-'}</p>
            </div>
            {log.patient_id ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/patients/${log.patient_id}`}>
                  Profile <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            ) : null}
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Message Content</h4>
            <div className="bg-[#e5ddd5] p-4 rounded-lg relative border shadow-sm">
              <div className="bg-white p-3 rounded-md text-sm whitespace-pre-wrap shadow-sm">
                {log.message || log.content || '-'}
              </div>
            </div>
          </div>

          {/* Error Details (if failed) */}
          {log.status === 'failed' && (log.error || log.error_reason) && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-1">
              <h4 className="text-sm font-medium text-red-900">Delivery Failed</h4>
              <p className="text-sm text-red-700">{log.error || log.error_reason}</p>
            </div>
          )}

          {/* Response (if any) */}
          {log.response && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Patient Response</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900">{log.response}</p>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 pt-6 border-t">
          {(log.status === 'failed' || log.status === 'sent') && (
            <Button 
              className="w-full sm:w-auto" 
              onClick={handleResend}
              disabled={resend.isPending}
            >
              {resend.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Resend Message
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
