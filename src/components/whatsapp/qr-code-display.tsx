'use client'

import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X, Clock } from 'lucide-react'
import { differenceInSeconds } from 'date-fns'

interface QrCodeDisplayProps {
  qrCode: string
  expiresAt?: string
  onRefresh: () => void
  onCancel: () => void
}

export function QrCodeDisplay({ qrCode, expiresAt, onRefresh, onCancel }: QrCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = React.useState<number>(0)

  React.useEffect(() => {
    if (!expiresAt) return

    const updateTimer = () => {
      const diff = differenceInSeconds(new Date(expiresAt), new Date())
      setTimeLeft(diff > 0 ? diff : 0)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative p-4 bg-white rounded-lg shadow-sm border">
        {/* Overlay if expired */}
        {timeLeft === 0 && expiresAt && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg z-10">
            <p className="text-sm font-medium text-muted-foreground mb-2">QR Code Expired</p>
            <Button size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
        
        <QRCodeSVG value={qrCode} size={256} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          Expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
        <X className="mr-2 h-4 w-4" />
        Cancel Connection
      </Button>
    </div>
  )
}
