"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WaitlistEntry, WaitlistPriority, WaitlistStatus } from "@/types/waiting-list"
import { format } from "date-fns"
import { MoreHorizontal, Calendar, Bell, Trash2, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { NotifyPatientDialog } from "./notify-patient-dialog"
import { ConvertToAppointmentDialog } from "./convert-to-appointment-dialog"
import { useRemoveFromWaitlist } from "@/hooks/use-waiting-list"
import { toast } from "sonner"

interface WaitlistTableProps {
  data: WaitlistEntry[]
}

export function WaitlistTable({ data }: WaitlistTableProps) {
  const [notifyEntry, setNotifyEntry] = useState<WaitlistEntry | null>(null)
  const [convertEntry, setConvertEntry] = useState<WaitlistEntry | null>(null)
  const { mutate: remove } = useRemoveFromWaitlist()

  const handleRemove = (id: string) => {
    remove(id, {
        onSuccess: () => toast.success("Removed from waiting list"),
        onError: (err) => toast.error(err.message)
    })
  }

  const getPriorityColor = (priority: WaitlistPriority) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default' 
      case 'low': return 'outline'
    }
  }

  const getStatusColor = (status: WaitlistStatus) => {
    switch (status) {
      case 'waiting': return 'secondary'
      case 'notified': return 'default' // Changed from warning as it might not exist
      case 'booked': return 'default'
      case 'expired': return 'destructive'
      case 'cancelled': return 'outline'
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Preferences</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                    No entries found.
                </TableCell>
            </TableRow>
          ) : (
            data.map((entry) => (
                <TableRow key={entry.id}>
                <TableCell>
                    <div className="font-medium">{entry.patient?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{entry.patient?.phone}</div>
                </TableCell>
                <TableCell>{entry.service?.name}</TableCell>
                <TableCell>
                    <div className="text-sm">
                    {format(new Date(entry.preferences.date_from), 'MMM d')} - {format(new Date(entry.preferences.date_to), 'MMM d')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                    {entry.preferences.times?.join(', ')}
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant={getPriorityColor(entry.priority) as any}>
                    {entry.priority}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getStatusColor(entry.status) as any} className="capitalize">
                    {entry.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setNotifyEntry(entry)}>
                        <Bell className="mr-2 h-4 w-4" /> Notify
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConvertEntry(entry)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Book
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemove(entry.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {notifyEntry && (
        <NotifyPatientDialog 
          open={!!notifyEntry} 
          onOpenChange={(open) => !open && setNotifyEntry(null)}
          entry={notifyEntry}
        />
      )}

      {convertEntry && (
        <ConvertToAppointmentDialog
          open={!!convertEntry}
          onOpenChange={(open) => !open && setConvertEntry(null)}
          entry={convertEntry}
        />
      )}
    </>
  )
}
