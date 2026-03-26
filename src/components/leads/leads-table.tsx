"use client"

import { Lead } from "@/types/leads"
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
import { MoreHorizontal, Phone, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils/cn"

interface LeadsTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onConvert: (lead: Lead) => void
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  qualified: "bg-purple-100 text-purple-800 border-purple-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-gray-100 text-gray-800 border-gray-200",
}

export function LeadsTable({ leads, onEdit, onDelete, onConvert }: LeadsTableProps) {
  const handleWhatsApp = (phone: string | null) => {
    if (phone) {
      const number = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${number}`, '_blank')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.full_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("capitalize", statusColors[lead.status])}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {lead.source.replace('_', ' ')}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {lead.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">{lead.phone}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleWhatsApp(lead.phone)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {lead.email && (
                    <span className="text-xs text-muted-foreground">{lead.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{lead.interest || '-'}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(lead.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(lead)}>
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConvert(lead)}>
                      Convert to Patient
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(lead)}>
                      Delete Lead
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No leads found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
