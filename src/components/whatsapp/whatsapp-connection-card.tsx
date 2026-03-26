'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWhatsApp } from '@/hooks/use-whatsapp'
import { Loader2, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function WhatsAppConnectionCard() {
  const { data, isLoading, disconnect, refresh } = useWhatsApp()

  if (isLoading) {
    return (
      <Card className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  const isConnected = data?.status === 'connected'

  return (
    <Card className={isConnected ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-muted'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}
              {isConnected ? 'Connected' : 'Not Connected'}
            </CardTitle>
            <CardDescription>
              {isConnected ? 'WhatsApp Business API is active for this clinic.' : 'Connect a clinic number to send reminders.'}
            </CardDescription>
          </div>
          <Badge variant="outline" className={isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
            {isConnected ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {data?.phoneNumberId ? `Phone Number ID: ${data.phoneNumberId}` : 'No number configured yet.'}
      </CardContent>
      <CardFooter className="flex justify-between border-t py-4">
        <Button variant="outline" onClick={refresh}>Refresh Status</Button>
        {isConnected && (
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
