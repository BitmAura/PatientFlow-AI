'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useInboxUnreadCount() {
  return useQuery({
    queryKey: ['inbox-unread-count'],
    queryFn: async () => {
      const res = await fetch('/api/inbox?status=received&limit=1')
      if (!res.ok) return 0
      const data = await res.json()
      return (data.total as number) ?? 0
    },
    refetchInterval: 30_000, // poll every 30s
    staleTime: 20_000,
  })
}

export function useInboxMessages(filter: 'all' | 'received' | 'processed' = 'all', page = 1) {
  return useQuery({
    queryKey: ['inbox-messages', filter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: String(page) })
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/inbox?${params}`)
      if (!res.ok) throw new Error('Failed to load inbox')
      return res.json() as Promise<{ messages: any[]; total: number; page: number; limit: number }>
    },
    staleTime: 15_000,
  })
}

export function useReplyToMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ messageId, text }: { messageId: string; text: string }) => {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] })
      queryClient.invalidateQueries({ queryKey: ['inbox-unread-count'] })
    },
  })
}
