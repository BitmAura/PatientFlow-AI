import { useCallback, useEffect, useState } from 'react'
import { BotPersonality } from '@/lib/ai/bot-personality'

export type WhatsAppStatus = {
  status: 'disconnected' | 'connecting' | 'connected' | 'expired' | 'active'
  connected: boolean
  setupMode?: 'auto' | 'manual'
  lastActivity?: string | null
  phoneNumberId?: string | null
  provider?: string | null
  clinicId?: string | null
  bot_personality?: BotPersonality | null
  name?: string | null
  use_shared_number?: boolean
}

function normalizeWhatsAppStatus(payload: any): WhatsAppStatus {
  const rawStatus = payload?.status === 'active' ? 'connected' : payload?.status
  const status =
    rawStatus === 'connected' ||
    rawStatus === 'connecting' ||
    rawStatus === 'expired' ||
    rawStatus === 'disconnected'
      ? rawStatus
      : 'disconnected'

  return {
    ...payload,
    status,
    connected: Boolean(payload?.connected || status === 'connected'),
  }
}

async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
  const bodyText = await response.text().catch(() => '')
  if (!bodyText) return fallback

  try {
    const parsed = JSON.parse(bodyText)
    if (typeof parsed?.error === 'string' && parsed.error) return parsed.error
    if (typeof parsed?.message === 'string' && parsed.message) return parsed.message
  } catch {
    // Ignore JSON parse errors and fall back to raw text.
  }

  return bodyText || fallback
}

const STATUS_CACHE_TTL_MS = 15_000
let cachedStatus: WhatsAppStatus | null = null
let cachedStatusAt = 0
let inFlightStatusRequest: Promise<WhatsAppStatus> | null = null

function writeStatusCache(status: WhatsAppStatus) {
  cachedStatus = status
  cachedStatusAt = Date.now()
}

async function fetchWhatsAppStatus(force = false): Promise<WhatsAppStatus> {
  const now = Date.now()
  if (!force && cachedStatus && now - cachedStatusAt < STATUS_CACHE_TTL_MS) {
    return cachedStatus
  }

  if (!force && inFlightStatusRequest) {
    return inFlightStatusRequest
  }

  inFlightStatusRequest = (async () => {
    const response = await fetch('/api/whatsapp/status', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to fetch WhatsApp status'))
    }
    const json = await response.json()
    const normalized = normalizeWhatsAppStatus(json)
    writeStatusCache(normalized)
    return normalized
  })()

  try {
    return await inFlightStatusRequest
  } finally {
    inFlightStatusRequest = null
  }
}

export function useWhatsApp() {
  const [data, setData] = useState<WhatsAppStatus | null>(cachedStatus)
  const [isLoading, setIsLoading] = useState(!cachedStatus)

  const refresh = useCallback(async (force = false) => {
    setIsLoading(true)
    try {
      const status = await fetchWhatsAppStatus(force)
      setData(status)
    } catch {
      setData({ status: 'disconnected', connected: false })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh(false)
  }, [refresh])

  const startAutoSetup = async (phoneNumber: string) => {
    const response = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to start WhatsApp setup'))
    }

    const json = await response.json()
    const normalized = normalizeWhatsAppStatus(json)
    writeStatusCache(normalized)
    setData(normalized)
    return normalized
  }

  const saveApiKeys = async (keys: { phoneNumberId: string; accessToken: string; webhookSecret?: string }) => {
    const response = await fetch('/api/whatsapp/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys)
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to save WhatsApp configuration'))
    }

    const json = await response.json()
    const normalized = normalizeWhatsAppStatus(json)
    writeStatusCache(normalized)
    setData(normalized)
    return normalized
  }

  const disconnect = async () => {
    const response = await fetch('/api/whatsapp/disconnect', { method: 'POST' })
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to disconnect WhatsApp'))
    }

    const json = await response.json()
    const normalized = normalizeWhatsAppStatus(json)
    writeStatusCache(normalized)
    setData(normalized)
    return normalized
  }

  const sendTestMessage = async (phone: string, message: string) => {
    const response = await fetch('/api/whatsapp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to send test message'))
    }

    return response.json()
  }

  const setSharedNumberMode = async (enabled: boolean) => {
    const response = await fetch('/api/whatsapp/mode', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useSharedNumber: enabled })
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to update WhatsApp mode'))
    }

    const { data: updatedData } = await response.json()
    const normalized = normalizeWhatsAppStatus(updatedData)
    writeStatusCache(normalized)
    setData(normalized)
    return normalized
  }

  return {
    data,
    isLoading,
    refresh,
    startAutoSetup,
    saveApiKeys,
    disconnect,
    sendTestMessage,
    setSharedNumberMode
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