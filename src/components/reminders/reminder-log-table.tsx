'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MessageStatusIcon } from './message-status-icon'
import { ReminderLog, useResendMessage } from '@/hooks/use-reminder-logs'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, RefreshCw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageDetailSheet } from './message-detail-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface ReminderLogTableProps {
  data: ReminderLog[]
  isLoading: boolean
}

export function ReminderLogTable({ data, isLoading }: ReminderLogTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<ReminderLog | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const resend = useResendMessage()
  const { toast } = useToast()

  const handleView = (log: ReminderLog) => {
    setSelectedLog(log)
    setSheetOpen(true)
  }

  const handleResend = async (logId: string) => {
    try {
      await resend.mutateAsync(logId)
      toast({ title: 'Reminder queued', description: 'Reminder resend has been initiated.' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Resend failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No logs found matching your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Sent At</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
              <TableRow 
                key={log.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(log)}
              >
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(log.created_at), 'MMM d, p')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{log.patients?.full_name || 'Unknown patient'}</span>
                    <span className="text-xs text-muted-foreground">{log.patients?.phone || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize font-normal">
                    {log.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MessageStatusIcon status={log.status} />
                    <span className="text-sm capitalize">{log.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {log.message || log.content ? (
                    <span className="text-sm truncate max-w-[280px] block" title={log.message || log.content}>
                      {log.message || log.content}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(log)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {(log.status === 'failed') && (
                        <DropdownMenuItem onClick={() => void handleResend(log.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MessageDetailSheet 
        log={selectedLog} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </>
  )
}
