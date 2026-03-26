import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useImportPatients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, options }: { data: any[], options: any }) => {
      const response = await fetch('/api/patients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, options }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Import failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
