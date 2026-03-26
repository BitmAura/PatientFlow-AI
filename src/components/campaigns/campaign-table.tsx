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
import { MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'

interface CampaignTableProps {
  data: any[]
  isLoading: boolean
}

export function CampaignTable({ data, isLoading }: CampaignTableProps) {
  if (isLoading) return <div>Loading...</div>

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{campaign.type.replace('_', ' ')}</Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }
                  variant="secondary"
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{campaign.recipients_count || '-'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No campaigns found. Create one to get started!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
