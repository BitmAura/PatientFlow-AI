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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Send, MoreHorizontal, CalendarPlus } from 'lucide-react'
import { format, isToday, isPast } from 'date-fns'
import { FOLLOWUP_TYPES } from '@/constants/followup-types'
import { useSendFollowup } from '@/hooks/use-followups'
import { useToast } from '@/hooks/use-toast'

interface FollowupTableProps {
  data: any[]
  isLoading: boolean
}

export function FollowupTable({ data, isLoading }: FollowupTableProps) {
  const send = useSendFollowup()
  const { toast } = useToast()

  const handleSend = async (id: string) => {
    try {
      await send.mutateAsync(id)
      toast({ title: 'Message Sent', description: 'Follow-up message sent successfully.' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' })
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const typeConfig = FOLLOWUP_TYPES.find(t => t.id === item.type)
            const dueDate = new Date(item.due_date)
            const isDueToday = isToday(dueDate)
            const isOverdue = isPast(dueDate) && !isToday(dueDate) && item.status === 'pending'

            return (
              <TableRow 
                key={item.id}
                className={isOverdue ? 'bg-red-50/50' : isDueToday ? 'bg-amber-50/50' : ''}
              >
                <TableCell>
                  <div className="font-medium">{item.patient.full_name}</div>
                  <div className="text-xs text-muted-foreground">{item.patient.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeConfig?.bg + ' ' + typeConfig?.color + ' border-0'}>
                    {typeConfig?.name || item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleSend(item.id)}
                        disabled={send.isPending}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No follow-ups found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
