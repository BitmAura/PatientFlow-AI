'use client'

import * as React from 'react'
import { CardContent } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MoreHorizontal, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PatientCardProps {
  patient: any
  onAction?: (action: string, patient: any) => void
}

export function PatientCard({ patient, onAction }: PatientCardProps) {
  const initials = patient.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <GlassCard className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10 transition-colors group-hover:border-primary/30">
              <AvatarFallback className="bg-primary/5 font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold leading-none">
                  {patient.full_name}
                </h4>
                {patient.is_vip && (
                  <Badge
                    variant="secondary"
                    className="h-5 border-yellow-200/50 bg-yellow-100/50 text-[10px] text-yellow-800 backdrop-blur-sm"
                  >
                    VIP
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {patient.phone}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {patient.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 h-8 w-8 hover:bg-white/20"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/patients/${patient.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/patients/${patient.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction?.('delete', patient)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Visits</p>
            <p className="font-semibold">{patient.total_visits || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">No-Shows</p>
            <p
              className={`font-semibold ${patient.no_shows > 0 ? 'text-red-600' : ''}`}
            >
              {patient.no_shows || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Visit</p>
            <p className="mt-0.5 text-xs font-medium">
              {patient.last_visit
                ? format(new Date(patient.last_visit), 'MMM d')
                : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  )
}
