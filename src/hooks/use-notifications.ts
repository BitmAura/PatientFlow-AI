import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    },
    refetchInterval: 30000 // Poll every 30s
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?read=false&limit=1')
      if (!res.ok) throw new Error('Failed to fetch unread count')
      const data = await res.json()
      return data.unread_count
    },
    refetchInterval: 30000
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    }
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    }
  })
}

export function useActivityFeed(limit = 10) {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const res = await fetch(`/api/activity?limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch activity feed')
      return res.json()
    }
  })
}
