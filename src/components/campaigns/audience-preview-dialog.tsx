'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

interface AudiencePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: { count: number, sample: any[] } | null
}

export function AudiencePreviewDialog({ open, onOpenChange, data }: AudiencePreviewDialogProps) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Audience Preview</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-lg font-semibold mb-6">
            {data.count} patients match your filters
          </p>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sample.map((patient: any) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>
                      {patient.last_visit_date ? format(new Date(patient.last_visit_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing first {data.sample.length} results
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
