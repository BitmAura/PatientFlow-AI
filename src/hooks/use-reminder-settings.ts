import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReminderSettings } from '@/lib/validations/reminder'

export function useReminderSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading, isError } = useQuery<ReminderSettings>({
    queryKey: ['reminder-settings'],
    queryFn: async () => {
      const res = await fetch('/api/reminders/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })

  const updateSettings = useMutation({
    mutationFn: async (newSettings: ReminderSettings) => {
      const res = await fetch('/api/reminders/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings'] })
    },
  })

  return {
    settings,
    isLoading,
    isError,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  }
}
