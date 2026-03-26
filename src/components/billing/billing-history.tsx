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
import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format-currency'

interface BillingHistoryProps {
  invoices: any[]
  isLoading?: boolean
}

export function BillingHistory({ invoices, isLoading }: BillingHistoryProps) {
  if (isLoading) {
    return <div className="h-40 bg-gray-50 animate-pulse rounded-lg" />
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg">
        No billing history available.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Invoice</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{format(new Date(invoice.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>{invoice.description}</TableCell>
            <TableCell>{formatCurrency(invoice.amount)}</TableCell>
            <TableCell>
              <Badge variant={invoice.status === 'paid' ? 'outline' : 'secondary'} className={invoice.status === 'paid' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <a href={`/api/subscription/invoice/${invoice.id}`} target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
