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
import { format } from 'date-fns'
import { useCampaignRecipients } from '@/hooks/use-campaign-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface CampaignRecipientsTableProps {
  campaignId: string
}

export function CampaignRecipientsTable({ campaignId }: CampaignRecipientsTableProps) {
  const [page, setPage] = React.useState(1)
  const { data, isLoading } = useCampaignRecipients(campaignId, { page, limit: 10 })

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Booked</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((recipient: any) => (
            <TableRow key={recipient.id}>
              <TableCell className="font-medium">{recipient.patient.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{recipient.patient.phone}</TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  recipient.status === 'sent' ? 'border-green-500 text-green-600' :
                  recipient.status === 'failed' ? 'border-red-500 text-red-600' :
                  ''
                }>
                  {recipient.status}
                </Badge>
              </TableCell>
              <TableCell>
                {recipient.sent_at ? format(new Date(recipient.sent_at), 'p') : '-'}
              </TableCell>
              <TableCell>
                {recipient.booked ? <Badge className="bg-green-500">Booked</Badge> : '-'}
              </TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No recipients found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Simple Pagination */}
      <div className="flex justify-between items-center p-4 border-t">
        <span className="text-sm text-muted-foreground">
          Page {page} of {data?.meta.totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= (data?.meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
