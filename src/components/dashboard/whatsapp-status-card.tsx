'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, AlertTriangle } from 'lucide-react'
import { useWhatsApp } from '@/hooks/use-whatsapp'

export function WhatsappStatusCard() {
  const { data: whatsappStatus, isLoading } = useWhatsApp()
  
  if (isLoading || whatsappStatus?.status === 'connected') return null

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg text-amber-900">WhatsApp Not Connected</CardTitle>
        </div>
        <CardDescription className="text-amber-800">
          Automated reminders will not be sent until you connect your WhatsApp account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
        >
          <Link href="/dashboard/settings/whatsapp" className="inline-flex items-center justify-center">
            <MessageSquare className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Connect WhatsApp Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
