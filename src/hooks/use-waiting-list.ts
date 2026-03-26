import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddToWaitlistInput } from '@/lib/validations/waiting-list';
import { WaitlistFilters } from '@/types/waiting-list';

export function useWaitingList(filters?: WaitlistFilters) {
  return useQuery({
    queryKey: ['waiting-list', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.service_id) params.append('service_id', filters.service_id);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/waiting-list?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch waiting list');
      return response.json();
    }
  });
}

export function useWaitlistStats() {
  return useQuery({
    queryKey: ['waiting-list-stats'],
    queryFn: async () => {
      const response = await fetch('/api/waiting-list/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });
}

export function useAddToWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddToWaitlistInput) => {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add to waiting list');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      queryClient.invalidateQueries({ queryKey: ['waiting-list-stats'] });
    }
  });
}

export function useNotifyWaitlistPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slot }: { id: string, slot: { available_date: string, available_time: string } }) => {
      const response = await fetch(`/api/waiting-list/${id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      });
      if (!response.ok) throw new Error('Failed to notify patient');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      queryClient.invalidateQueries({ queryKey: ['waiting-list-stats'] });
    }
  });
}

export function useConvertWaitlistToAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: { date: string, time: string } }) => {
      const response = await fetch(`/api/waiting-list/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to convert to appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      queryClient.invalidateQueries({ queryKey: ['waiting-list-stats'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
}

export function useRemoveFromWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/waiting-list/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove from waiting list');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      queryClient.invalidateQueries({ queryKey: ['waiting-list-stats'] });
    }
  });
}

export function useCheckWaitlistAvailability() {
    return useMutation({
        mutationFn: async (data: { date: string, time: string, service_id: string }) => {
            const response = await fetch('/api/waiting-list/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to check availability');
            return response.json();
        }
    });
}
