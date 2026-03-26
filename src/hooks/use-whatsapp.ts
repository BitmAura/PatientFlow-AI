import { useCallback, useEffect, useState } from 'react'

export type WhatsAppStatus = {
  status: 'disconnected' | 'connecting' | 'connected' | 'expired'
  connected: boolean
  setupMode?: 'auto' | 'manual'
  lastActivity?: string | null
  phoneNumberId?: string | null
  provider?: string | null
}

export function useWhatsApp() {
  const [data, setData] = useState<WhatsAppStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/whatsapp/status', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch WhatsApp status')
      const json = await response.json()
      setData(json)
    } catch {
      setData({ status: 'disconnected', connected: false })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const startAutoSetup = async (phoneNumber: string) => {
    const response = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    })

    if (!response.ok) {
      throw new Error('Failed to start WhatsApp setup')
    }

    const json = await response.json()
    setData(json)
    return json
  }

  const saveApiKeys = async (keys: { phoneNumberId: string; accessToken: string; webhookSecret?: string }) => {
    const response = await fetch('/api/whatsapp/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys)
    })

    if (!response.ok) {
      throw new Error('Failed to save WhatsApp configuration')
    }

    const json = await response.json()
    setData(json)
    return json
  }

  const disconnect = async () => {
    const response = await fetch('/api/whatsapp/disconnect', { method: 'POST' })
    if (!response.ok) {
      throw new Error('Failed to disconnect WhatsApp')
    }

    const json = await response.json()
    setData(json)
    return json
  }

  const sendTestMessage = async (phone: string, message: string) => {
    const response = await fetch('/api/whatsapp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    })

    if (!response.ok) {
      throw new Error('Failed to send test message')
    }

    return response.json()
  }

  return {
    data,
    isLoading,
    refresh,
    startAutoSetup,
    saveApiKeys,
    disconnect,
    sendTestMessage
  }
}

import { useMutation } from '@tanstack/react-query'

export function useDisconnectWhatsApp() {
  const { disconnect } = useWhatsApp()
  return useMutation({
    mutationFn: disconnect
  })
}

export function useSendTestMessage() {
  const { sendTestMessage } = useWhatsApp()
  return useMutation({
    mutationFn: ({ phone, message }: { phone: string; message: string }) => sendTestMessage(phone, message)
  })
}