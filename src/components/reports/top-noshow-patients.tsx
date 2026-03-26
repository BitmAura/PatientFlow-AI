import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface TopNoShowPatientsProps {
  data: any[]
  isLoading?: boolean
}

export function TopNoShowPatients({ data, isLoading }: TopNoShowPatientsProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Frequent No-Shows</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead className="text-right">No-Shows</TableHead>
              <TableHead className="text-right">Total Appts</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Last Incident</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  <div>{item.patient.name}</div>
                  <div className="text-xs text-muted-foreground">{item.patient.phone}</div>
                </TableCell>
                <TableCell className="text-right text-red-600 font-bold">{item.no_shows}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={item.rate > 50 ? "destructive" : "secondary"}>
                    {item.rate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.last_no_show ? format(new Date(item.last_no_show), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="text-xs">
                    Require Deposit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No habitual no-show patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
